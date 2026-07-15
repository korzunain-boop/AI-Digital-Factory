import type { Page } from 'playwright';

import type { BrowserFactory } from './browser.js';
import { closeSession, defaultBrowserFactory } from './browser.js';
import { normalizeListing } from './normalize.js';
import { scrapeListingPage } from './scrape-listing.js';
import { collectSearchListingUrls, type CollectSearchOptions } from './scrape-search.js';
import type { EtsyListing, RawListingData, ResearchResult } from './types.js';
import { buildSearchUrl, canonicalizeListingUrl, classifyEtsyUrl } from './urls.js';
import { defaultOutputDir, writeResearchOutput } from './write-output.js';

export type ListingScraper = (page: Page, listingUrl: string) => Promise<RawListingData>;
export type SearchUrlCollector = (
  page: Page,
  searchUrl: string,
  options?: CollectSearchOptions,
) => Promise<string[]>;

export interface ResearchOptions {
  readonly browserFactory?: BrowserFactory;
  readonly scrapeListing?: ListingScraper;
  readonly collectSearchUrls?: SearchUrlCollector;
  readonly outputDir?: string;
  /** Max listings to scrape from a search page (first-page cap). */
  readonly maxListings?: number;
  readonly writeOutput?: boolean;
  /** Override stored result.input (e.g. free-text query for research-search). */
  readonly inputLabel?: string;
  /** Print search scrape diagnostics. */
  readonly debug?: boolean;
  readonly log?: (line: string) => void;
}

/**
 * Research a single listing URL or a search URL.
 */
export async function researchUrl(
  inputUrl: string,
  options: ResearchOptions = {},
): Promise<{ result: ResearchResult; outputPath: string | null }> {
  const kind = classifyEtsyUrl(inputUrl);
  if (kind === 'unknown') {
    throw new Error(
      `Unrecognized Etsy URL. Pass a listing URL (.../listing/123/...) or a search URL (.../search?q=...). Got: ${inputUrl}`,
    );
  }

  if (kind === 'listing') {
    return researchListing(inputUrl, options);
  }
  return researchSearchUrl(inputUrl, options);
}

/**
 * Research via free-text query → Etsy search URL → first page listings.
 */
export async function researchSearchQuery(
  query: string,
  options: ResearchOptions = {},
): Promise<{ result: ResearchResult; outputPath: string | null }> {
  return researchSearchUrl(buildSearchUrl(query), {
    ...options,
    inputLabel: options.inputLabel ?? query,
  });
}

async function researchListing(
  listingUrl: string,
  options: ResearchOptions,
): Promise<{ result: ResearchResult; outputPath: string | null }> {
  const factory = options.browserFactory ?? defaultBrowserFactory;
  const scrape = options.scrapeListing ?? scrapeListingPage;
  const session = await factory();
  try {
    const canonical = canonicalizeListingUrl(listingUrl);
    const raw = await scrape(session.page, canonical);
    const listing = normalizeListing(raw, canonical);
    const result = buildResult('listing', options.inputLabel ?? listingUrl, [listing]);
    const outputPath = await maybeWrite(result, options);
    return { result, outputPath };
  } finally {
    await closeSession(session);
  }
}

async function researchSearchUrl(
  searchUrl: string,
  options: ResearchOptions,
): Promise<{ result: ResearchResult; outputPath: string | null }> {
  const factory = options.browserFactory ?? defaultBrowserFactory;
  const scrape = options.scrapeListing ?? scrapeListingPage;
  const collect = options.collectSearchUrls ?? collectSearchListingUrls;
  const session = await factory();
  const maxListings = options.maxListings ?? 24;
  const outputDir = options.outputDir ?? defaultOutputDir();

  try {
    const urls = (
      await collect(session.page, searchUrl, {
        debug: options.debug,
        outputDir,
        log: options.log ?? ((line) => console.error(line)),
      })
    ).slice(0, maxListings);

    const listings: EtsyListing[] = [];

    for (const url of urls) {
      if (options.debug) {
        (options.log ?? console.error)(`[debug] scraping listing: ${url}`);
      }
      const raw = await scrape(session.page, url);
      listings.push(normalizeListing(raw, url));
    }

    const result = buildResult('search', options.inputLabel ?? searchUrl, listings);
    const outputPath = await maybeWrite(result, options);
    return { result, outputPath };
  } finally {
    await closeSession(session);
  }
}

function buildResult(
  source: 'listing' | 'search',
  input: string,
  listings: readonly EtsyListing[],
): ResearchResult {
  return {
    source,
    queriedAt: new Date().toISOString(),
    input,
    listingCount: listings.length,
    listings,
  };
}

async function maybeWrite(
  result: ResearchResult,
  options: ResearchOptions,
): Promise<string | null> {
  if (options.writeOutput === false) {
    return null;
  }
  return writeResearchOutput(result, options.outputDir ?? defaultOutputDir());
}
