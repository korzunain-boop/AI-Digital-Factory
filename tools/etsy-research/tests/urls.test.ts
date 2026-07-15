import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildSearchUrl,
  canonicalizeListingUrl,
  classifyEtsyUrl,
  extractListingId,
} from '../src/urls.js';

describe('classifyEtsyUrl', () => {
  it('detects listing and search URLs', () => {
    assert.equal(classifyEtsyUrl('https://www.etsy.com/listing/123456789/cool-poster'), 'listing');
    assert.equal(classifyEtsyUrl('https://www.etsy.com/search?q=posters'), 'search');
    assert.equal(classifyEtsyUrl('https://example.com/listing/1'), 'unknown');
    assert.equal(classifyEtsyUrl('not-a-url'), 'unknown');
  });
});

describe('url helpers', () => {
  it('builds search URLs and canonicalizes listings', () => {
    assert.equal(
      buildSearchUrl('educational posters'),
      'https://www.etsy.com/search?q=educational+posters',
    );
    assert.equal(
      canonicalizeListingUrl('https://www.etsy.com/listing/99/slug?ref=x'),
      'https://www.etsy.com/listing/99/slug',
    );
    assert.equal(extractListingId('https://www.etsy.com/listing/99/slug'), '99');
  });
});
