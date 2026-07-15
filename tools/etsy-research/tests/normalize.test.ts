import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  cleanText,
  normalizeListing,
  parseBreadcrumb,
  parseCurrency,
  parsePrice,
  parseRating,
  parseReviewCount,
  toFiniteNumber,
} from '../src/normalize.js';

describe('normalizeListing', () => {
  it('normalizes messy raw scrape fields into JSON-ready listing', () => {
    const listing = normalizeListing(
      {
        listingUrl: 'https://www.etsy.com/listing/123456789/poster?ref=search',
        title: '  Educational  Poster Pack  ',
        priceText: '$18.50 USD',
        ratingText: '4.8 out of 5 stars',
        reviewCountText: '(1.2k)',
        shopName: ' PosterShop ',
        description: 'Line one.\n\n\nLine two.  ',
        imageUrls: [
          'https://i.etsystatic.com/a.jpg',
          'https://i.etsystatic.com/a.jpg',
          'https://i.etsystatic.com/b.jpg',
          null,
        ],
        breadcrumbText: 'Home > Art & Collectibles > Prints',
      },
      'https://www.etsy.com/listing/123456789/fallback',
    );

    assert.equal(listing.title, 'Educational Poster Pack');
    assert.equal(listing.price, 18.5);
    assert.equal(listing.currency, 'USD');
    assert.equal(listing.rating, 4.8);
    assert.equal(listing.reviewCount, 1200);
    assert.equal(listing.shopName, 'PosterShop');
    assert.equal(listing.description, 'Line one.\n\nLine two.');
    assert.deepEqual(listing.imageUrls, [
      'https://i.etsystatic.com/a.jpg',
      'https://i.etsystatic.com/b.jpg',
    ]);
    assert.deepEqual(listing.categoryBreadcrumb, ['Home', 'Art & Collectibles', 'Prints']);
    assert.equal(listing.listingUrl, 'https://www.etsy.com/listing/123456789/poster');
  });

  it('prefers numeric fields over text when both present', () => {
    const listing = normalizeListing(
      {
        price: 21,
        priceText: '$9.99',
        currency: 'eur',
        rating: 5,
        ratingText: '1 out of 5',
        reviewCount: 42,
        reviewCountText: '999',
        categoryBreadcrumb: ['A', 'B'],
        breadcrumbText: 'X > Y',
      },
      'https://www.etsy.com/listing/1/x',
    );

    assert.equal(listing.price, 21);
    assert.equal(listing.currency, 'EUR');
    assert.equal(listing.rating, 5);
    assert.equal(listing.reviewCount, 42);
    assert.deepEqual(listing.categoryBreadcrumb, ['A', 'B']);
  });

  it('returns nulls for missing optional fields', () => {
    const listing = normalizeListing({}, 'https://www.etsy.com/listing/9/item');
    assert.equal(listing.title, null);
    assert.equal(listing.price, null);
    assert.equal(listing.currency, null);
    assert.equal(listing.rating, null);
    assert.equal(listing.reviewCount, null);
    assert.equal(listing.shopName, null);
    assert.equal(listing.description, null);
    assert.deepEqual(listing.imageUrls, []);
    assert.deepEqual(listing.categoryBreadcrumb, []);
    assert.equal(listing.listingUrl, 'https://www.etsy.com/listing/9/item');
  });
});

describe('parse helpers', () => {
  it('parses price, currency, rating, reviews, breadcrumb', () => {
    assert.equal(parsePrice('USD 12.99'), 12.99);
    assert.equal(parseCurrency('£4.00'), 'GBP');
    assert.equal(parseRating('4.85 / 5'), 4.85);
    assert.equal(parseReviewCount('reviews (320)'), 320);
    assert.deepEqual(parseBreadcrumb('A › B → C'), ['A', 'B', 'C']);
    assert.equal(toFiniteNumber('1,234.5'), 1234.5);
    assert.equal(cleanText('  a \n b '), 'a b');
  });
});
