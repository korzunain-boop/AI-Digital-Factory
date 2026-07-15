import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import type { BrowserSession } from '../src/browser.js';
import { researchSearchQuery, researchUrl } from '../src/research.js';
import type { RawListingData } from '../src/types.js';

function fakeSession(): BrowserSession {
  const page = {
    goto: async () => undefined,
    evaluate: async () => undefined,
  } as unknown as BrowserSession['page'];

  return {
    browser: { close: async () => undefined } as BrowserSession['browser'],
    context: { close: async () => undefined } as BrowserSession['context'],
    page,
  };
}

describe('research orchestration (mocked Playwright)', () => {
  it('researches a listing URL without launching a browser', async () => {
    const outputDir = await mkdtemp(join(tmpdir(), 'etsy-research-'));
    try {
      const { result, outputPath } = await researchUrl(
        'https://www.etsy.com/listing/555/demo-listing',
        {
          browserFactory: async () => fakeSession(),
          scrapeListing: async (_page, listingUrl): Promise<RawListingData> => ({
            listingUrl,
            title: 'Demo Listing',
            price: 10,
            currency: 'USD',
            rating: 4.5,
            reviewCount: 12,
            shopName: 'DemoShop',
            description: 'A demo',
            imageUrls: ['https://i.etsystatic.com/demo.jpg'],
            categoryBreadcrumb: ['Art', 'Prints'],
          }),
          outputDir,
        },
      );

      assert.equal(result.source, 'listing');
      assert.equal(result.listingCount, 1);
      assert.equal(result.listings[0]?.title, 'Demo Listing');
      assert.equal(result.listings[0]?.price, 10);
      assert.ok(outputPath);
      const written = JSON.parse(await readFile(outputPath!, 'utf8')) as typeof result;
      assert.equal(written.listings[0]?.shopName, 'DemoShop');
    } finally {
      await rm(outputDir, { recursive: true, force: true });
    }
  });

  it('researches a search query using mocked first-page listing URLs', async () => {
    const calls: string[] = [];
    const { result, outputPath } = await researchSearchQuery('educational posters', {
      browserFactory: async () => fakeSession(),
      writeOutput: false,
      collectSearchUrls: async () => [
        'https://www.etsy.com/listing/1/a',
        'https://www.etsy.com/listing/2/b',
      ],
      scrapeListing: async (_page, listingUrl): Promise<RawListingData> => {
        calls.push(listingUrl);
        return {
          listingUrl,
          title: `Title for ${listingUrl}`,
          priceText: '$5.00',
          currency: 'USD',
        };
      },
    });

    assert.equal(result.source, 'search');
    assert.equal(result.input, 'educational posters');
    assert.equal(result.listingCount, 2);
    assert.equal(result.listings[0]?.price, 5);
    assert.deepEqual(calls, [
      'https://www.etsy.com/listing/1/a',
      'https://www.etsy.com/listing/2/b',
    ]);
    assert.equal(outputPath, null);
  });

  it('rejects unknown URLs', async () => {
    await assert.rejects(
      () =>
        researchUrl('https://example.com/not-etsy', {
          browserFactory: async () => fakeSession(),
          writeOutput: false,
        }),
      /Unrecognized Etsy URL/,
    );
  });
});
