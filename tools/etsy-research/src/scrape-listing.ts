import type { Page } from 'playwright';

import { EXTRACT_LISTING_SCRIPT } from './browser-scripts.js';
import type { RawListingData } from './types.js';

/**
 * Extract raw listing fields from a loaded Etsy listing page.
 * Prefers JSON-LD Product schema; falls back to meta / DOM heuristics.
 */
export async function scrapeListingPage(page: Page, listingUrl: string): Promise<RawListingData> {
  await page.goto(listingUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await delay(750);

  const raw = (await page.evaluate(EXTRACT_LISTING_SCRIPT)) as RawListingData;

  return {
    ...raw,
    listingUrl: raw.listingUrl || listingUrl,
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
