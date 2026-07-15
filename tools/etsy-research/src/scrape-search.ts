import type { Page } from 'playwright';

import { COLLECT_SEARCH_URLS_SCRIPT } from './browser-scripts.js';

/**
 * Collect listing URLs from the first page of an Etsy search results page.
 */
export async function collectSearchListingUrls(page: Page, searchUrl: string): Promise<string[]> {
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await delay(1000);

  const urls = (await page.evaluate(COLLECT_SEARCH_URLS_SCRIPT)) as string[];
  return urls;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
