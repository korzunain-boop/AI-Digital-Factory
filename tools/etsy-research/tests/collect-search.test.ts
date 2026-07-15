import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import type { Page } from 'playwright';

import { AntiBotError } from '../src/anti-bot.js';
import { collectSearchListingUrls } from '../src/scrape-search.js';

const DATADOME_HTML = `<html lang="en"><head><title>etsy.com</title></head><body><script src="https://ct.captcha-delivery.com/c.js"></script><iframe src="https://geo.captcha-delivery.com/captcha/" title="DataDome CAPTCHA"></iframe></body></html>`;

const READY_SEARCH_HTML = `<html><head><title>Posters - Etsy</title></head><body>
<div class="v2-listing-card" data-listing-id="42"><a href="/listing/42/cool-poster">Cool</a></div>
</body></html>`;

function mockPage(html: string, title: string, url: string): Page {
  return {
    goto: async () => undefined,
    content: async () => html,
    title: async () => title,
    url: () => url,
    evaluate: async (fn: unknown) => {
      if (typeof fn === 'function') {
        // waitForSearchReady probe — simulate listing signals from HTML
        const listingAnchors = (html.match(/\/listing\/\d+/g) ?? []).length;
        const hasCaptcha = /captcha-delivery|datadome/i.test(html);
        return {
          listingSignals: hasCaptcha ? 0 : listingAnchors,
          hasCaptcha,
        };
      }
      return undefined;
    },
    waitForLoadState: async () => undefined,
  } as unknown as Page;
}

describe('collectSearchListingUrls', () => {
  it('throws AntiBotError and writes debug.html for DataDome pages', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'etsy-antibot-'));
    try {
      await assert.rejects(
        () =>
          collectSearchListingUrls(
            mockPage(DATADOME_HTML, 'etsy.com', 'https://www.etsy.com/search?q=x'),
            'https://www.etsy.com/search?q=x',
            { outputDir, waitTimeoutMs: 50, debug: true, log: () => undefined },
          ),
        (err: unknown) => {
          assert.ok(err instanceof AntiBotError);
          assert.match(err.message, /anti-bot|DataDome/i);
          return true;
        },
      );
      const saved = await readFile(join(outputDir, 'debug.html'), 'utf8');
      assert.match(saved, /captcha-delivery/);
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });

  it('returns listing URLs once results HTML is present', async () => {
    const urls = await collectSearchListingUrls(
      mockPage(READY_SEARCH_HTML, 'Posters - Etsy', 'https://www.etsy.com/search?q=posters'),
      'https://www.etsy.com/search?q=posters',
      { waitTimeoutMs: 50, write: true, log: () => undefined },
    );
    assert.deepEqual(urls, ['https://www.etsy.com/listing/42/cool-poster']);
  });
});
