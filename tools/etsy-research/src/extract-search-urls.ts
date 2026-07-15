/**
 * Pure search-result URL extraction (no Playwright).
 * Used by the scraper after page HTML is available, and by unit tests with fixtures.
 */

export interface ListingUrlExtraction {
  readonly urls: readonly string[];
  readonly cardCount: number;
  readonly selectorUsed: string;
  readonly strategiesTried: readonly string[];
}

/**
 * Extract unique listing URLs from search-results HTML.
 */
export function extractListingUrlsFromHtml(html: string): ListingUrlExtraction {
  const strategiesTried: string[] = [];
  const ordered: string[] = [];
  const seen = new Set<string>();

  const add = (rawHref: string): void => {
    const canonical = canonicalizeFromHref(rawHref);
    if (!canonical) {
      return;
    }
    const id = canonical.match(/\/listing\/(\d+)/)?.[1];
    if (!id || seen.has(id)) {
      return;
    }
    seen.add(id);
    ordered.push(canonical);
  };

  strategiesTried.push('a[href*="/listing/"]');
  for (const match of html.matchAll(/href=["']([^"']*\/listing\/\d+[^"']*)["']/gi)) {
    add(match[1] ?? '');
  }
  let selectorUsed = 'a[href*="/listing/"]';
  let cardCount = countCards(html);

  strategiesTried.push('data-listing-id');
  const idMatches = [...html.matchAll(/data-listing-id=["'](\d+)["']/gi)];
  for (const match of idMatches) {
    add(`https://www.etsy.com/listing/${match[1]}`);
  }
  if (ordered.length > 0 && idMatches.length > 0 && !/href=["'][^"']*\/listing\/\d+/i.test(html)) {
    selectorUsed = 'data-listing-id';
  }
  if (cardCount === 0) {
    cardCount = idMatches.length;
  }

  strategiesTried.push('JSON-LD ItemList');
  const jsonLdUrls = extractFromJsonLd(html);
  const beforeJson = ordered.length;
  for (const url of jsonLdUrls) {
    add(url);
  }
  if (beforeJson === 0 && jsonLdUrls.length > 0) {
    selectorUsed = 'JSON-LD ItemList';
    cardCount = Math.max(cardCount, jsonLdUrls.length);
  }

  if (ordered.length > 0 && cardCount === 0) {
    cardCount = ordered.length;
  }

  if (/v2-listing-card/i.test(html) && ordered.length > 0) {
    selectorUsed = '.v2-listing-card a[href*="/listing/"]';
    strategiesTried.push('.v2-listing-card a[href*="/listing/"]');
  }

  return {
    urls: ordered,
    cardCount,
    selectorUsed,
    strategiesTried,
  };
}

function countCards(html: string): number {
  const v2 = html.match(/v2-listing-card/gi)?.length ?? 0;
  if (v2 > 0) {
    return v2;
  }
  const byId = html.match(/data-listing-id=["']\d+["']/gi)?.length ?? 0;
  if (byId > 0) {
    return byId;
  }
  return html.match(/href=["'][^"']*\/listing\/\d+[^"']*["']/gi)?.length ?? 0;
}

function extractFromJsonLd(html: string): string[] {
  const urls: string[] = [];
  const scriptRe = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(scriptRe)) {
    const raw = match[1]?.trim();
    if (!raw) {
      continue;
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      collectItemListUrls(parsed, urls);
    } catch {
      // ignore
    }
  }
  return urls;
}

function collectItemListUrls(node: unknown, out: string[]): void {
  if (!node || typeof node !== 'object') {
    return;
  }
  if (Array.isArray(node)) {
    for (const item of node) {
      collectItemListUrls(item, out);
    }
    return;
  }
  const obj = node as Record<string, unknown>;
  const type = obj['@type'];
  const isItemList = type === 'ItemList' || (Array.isArray(type) && type.includes('ItemList'));
  if (isItemList && Array.isArray(obj.itemListElement)) {
    for (const el of obj.itemListElement) {
      if (el && typeof el === 'object') {
        const element = el as Record<string, unknown>;
        let url: string | null = null;
        if (typeof element.url === 'string') {
          url = element.url;
        } else if (element.item && typeof element.item === 'object') {
          const itemUrl = (element.item as { url?: unknown }).url;
          if (typeof itemUrl === 'string') {
            url = itemUrl;
          }
        }
        if (url && /\/listing\/\d+/i.test(url)) {
          out.push(url);
        }
      }
    }
  }
  for (const value of Object.values(obj)) {
    if (value && typeof value === 'object') {
      collectItemListUrls(value, out);
    }
  }
}

function canonicalizeFromHref(href: string): string | null {
  try {
    const absolute = href.startsWith('http')
      ? href
      : `https://www.etsy.com${href.startsWith('/') ? '' : '/'}${href}`;
    const url = new URL(absolute);
    const match = url.pathname.match(/\/listing\/(\d+)/i);
    if (!match?.[1]) {
      return null;
    }
    const slugMatch = url.pathname.match(/\/listing\/\d+\/([^/?#]+)/);
    const slug = slugMatch?.[1] ? `/${slugMatch[1]}` : '';
    return `https://www.etsy.com/listing/${match[1]}${slug}`;
  } catch {
    return null;
  }
}
