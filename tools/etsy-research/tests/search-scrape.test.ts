import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { detectAntiBot } from '../src/anti-bot.js';
import { extractListingUrlsFromHtml } from '../src/extract-search-urls.js';

const DATADOME_HTML = `<html lang="en"><head><title>etsy.com</title></head><body style="margin:0"><script data-cfasync="false">var dd={'rt':'c'}</script><script src="https://ct.captcha-delivery.com/c.js"></script><iframe src="https://geo.captcha-delivery.com/captcha/?x=1" title="DataDome CAPTCHA"></iframe></body></html>`;

const SEARCH_HTML = `
<html><head><title>Educational posters - Etsy</title></head>
<body>
  <div data-search-results>
    <div class="v2-listing-card" data-listing-id="111">
      <a href="/listing/111/poster-one?ref=search">Poster One</a>
    </div>
    <div class="v2-listing-card" data-listing-id="222">
      <a href="https://www.etsy.com/listing/222/poster-two">Poster Two</a>
    </div>
    <div class="v2-listing-card" data-listing-id="111">
      <a href="/listing/111/poster-one-dupe">dupe</a>
    </div>
  </div>
  <script type="application/ld+json">
  {"@type":"ItemList","itemListElement":[{"@type":"ListItem","url":"https://www.etsy.com/listing/333/from-json"}]}
  </script>
</body></html>
`;

describe('detectAntiBot', () => {
  it('detects DataDome interstitial HTML', () => {
    const result = detectAntiBot({
      html: DATADOME_HTML,
      title: 'etsy.com',
      bodyText: '',
    });
    assert.equal(result.detected, true);
    assert.equal(result.provider, 'DataDome');
    assert.ok(result.signals.length > 0);
  });

  it('does not flag a normal search results page', () => {
    const result = detectAntiBot({
      html: SEARCH_HTML,
      title: 'Educational posters - Etsy',
      bodyText: 'Poster One Poster Two',
    });
    assert.equal(result.detected, false);
  });
});

describe('extractListingUrlsFromHtml', () => {
  it('extracts unique listing URLs and reports selector/card counts', () => {
    const result = extractListingUrlsFromHtml(SEARCH_HTML);
    assert.deepEqual(result.urls, [
      'https://www.etsy.com/listing/111/poster-one',
      'https://www.etsy.com/listing/222/poster-two',
      'https://www.etsy.com/listing/333/from-json',
    ]);
    assert.ok(result.cardCount >= 2);
    assert.match(result.selectorUsed, /listing/);
  });

  it('returns empty for DataDome shell HTML', () => {
    const result = extractListingUrlsFromHtml(DATADOME_HTML);
    assert.equal(result.urls.length, 0);
    assert.equal(result.cardCount, 0);
  });
});
