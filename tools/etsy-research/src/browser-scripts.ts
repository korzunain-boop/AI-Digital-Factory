/**
 * Browser-side extractor strings.
 * Kept as strings so tsx/esbuild helpers (e.g. __name) are never injected into Playwright evaluate().
 */

export const EXTRACT_LISTING_SCRIPT = `(() => {
  const text = (el) => {
    if (!el) return null;
    const value = (el.textContent || '').replace(/\\s+/g, ' ').trim();
    return value.length > 0 ? value : null;
  };

  const attr = (el, name) => {
    if (!el) return null;
    const value = el.getAttribute(name);
    return value && value.trim() ? value.trim() : null;
  };

  const meta = (property) => {
    const el =
      document.querySelector('meta[property="' + property + '"]') ||
      document.querySelector('meta[name="' + property + '"]');
    return attr(el, 'content');
  };

  const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
  const nodes = [];
  for (const script of scripts) {
    const content = script.textContent;
    if (!content) continue;
    try {
      const parsed = JSON.parse(content);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of list) {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          nodes.push(item);
        }
      }
    } catch (e) {
      // ignore malformed JSON-LD
    }
  }

  const isProduct = (node) => {
    const type = node['@type'];
    if (type === 'Product') return true;
    return Array.isArray(type) && type.includes('Product');
  };

  const product = nodes.find(isProduct);

  const asString = (value) =>
    typeof value === 'string' && value.trim() ? value.trim() : null;

  const asNumberish = (value) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) return value.trim();
    return null;
  };

  let title = null;
  let description = null;
  let price = null;
  let currency = null;
  let rating = null;
  let reviewCount = null;
  let shopName = null;
  let imageUrls = [];
  let categoryBreadcrumb = [];
  let listingUrl = null;

  if (product) {
    title = asString(product.name);
    description = asString(product.description);
    listingUrl = asString(product.url);

    const brand = product.brand;
    if (brand && typeof brand === 'object' && !Array.isArray(brand)) {
      shopName = asString(brand.name);
    } else {
      shopName = asString(brand);
    }

    const offers = product.offers;
    const offer = Array.isArray(offers)
      ? offers[0] && typeof offers[0] === 'object'
        ? offers[0]
        : null
      : offers && typeof offers === 'object'
        ? offers
        : null;
    if (offer) {
      price = asNumberish(offer.price);
      currency = asString(offer.priceCurrency);
    }

    const ratingObj = product.aggregateRating;
    if (ratingObj && typeof ratingObj === 'object' && !Array.isArray(ratingObj)) {
      rating = asNumberish(ratingObj.ratingValue);
      reviewCount = asNumberish(ratingObj.reviewCount || ratingObj.ratingCount);
    }

    const image = product.image;
    if (typeof image === 'string') {
      imageUrls = [image];
    } else if (Array.isArray(image)) {
      imageUrls = image.filter((item) => typeof item === 'string');
    }

    const category = product.category;
    if (typeof category === 'string') {
      categoryBreadcrumb = category
        .split(/>|›|\\//)
        .map((p) => p.trim())
        .filter(Boolean);
    }
  }

  const breadcrumbEls = Array.from(
    document.querySelectorAll(
      'nav[aria-label*="breadcrumb" i] a, [data-testid="breadcrumbs"] a, .wt-breadcrumbs a',
    ),
  );
  if (categoryBreadcrumb.length === 0 && breadcrumbEls.length > 0) {
    categoryBreadcrumb = breadcrumbEls.map((el) => text(el)).filter(Boolean);
  }

  if (!title) {
    title = meta('og:title') || text(document.querySelector('h1'));
  }
  if (!description) {
    description =
      meta('og:description') ||
      meta('description') ||
      text(document.querySelector('[data-id="description-text"]')) ||
      text(document.querySelector('#description-text'));
  }
  if (!shopName) {
    shopName =
      text(document.querySelector('a[href*="/shop/"]')) ||
      attr(document.querySelector('a[href*="/shop/"]'), 'title');
  }
  if (imageUrls.length === 0) {
    const og = meta('og:image');
    if (og) imageUrls = [og];
    const gallery = Array.from(
      document.querySelectorAll(
        'ul[data-carousel-pagination-list] img, [data-testid="listing-page-image-carousel"] img, img[data-listing-card-listing-image]',
      ),
    )
      .map((img) => attr(img, 'src') || attr(img, 'data-src'))
      .filter(Boolean);
    imageUrls = imageUrls.concat(gallery);
  }

  const priceText =
    text(document.querySelector('[data-buy-box-region] [class*="currency-value"]')) ||
    text(document.querySelector('p[data-buy-box-region]')) ||
    text(document.querySelector('.wt-text-title-larger')) ||
    null;

  const ratingText =
    attr(document.querySelector('[name="rating"]'), 'content') ||
    attr(document.querySelector('[aria-label*="star rating" i]'), 'aria-label') ||
    text(document.querySelector('[data-reviews] [class*="rating"]'));

  const reviewCountText =
    text(document.querySelector('a[href*="#reviews"]')) ||
    text(document.querySelector('[data-review-count]'));

  return {
    listingUrl: listingUrl || window.location.href,
    title,
    description,
    price,
    currency,
    priceText,
    rating,
    ratingText,
    reviewCount,
    reviewCountText,
    shopName,
    imageUrls,
    categoryBreadcrumb,
    breadcrumbText: categoryBreadcrumb.join(' > ') || null,
  };
})()`;
