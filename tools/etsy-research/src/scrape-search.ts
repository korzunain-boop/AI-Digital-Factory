import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { Page } from 'playwright';

import { AntiBotError, detectAntiBot, SearchEmptyError } from './anti-bot.js';
import { extractListingUrlsFromHtml } from './extract-search-urls.js';

export interface SearchScrapeDebugInfo {
  readonly pageTitle: string;
  readonly currentUrl: string;
  readonly listingCardCount: number;
  readonly selectorUsed: string;
  readonly antiBotDetected: boolean;
  readonly antiBotProvider: string | null;
  readonly htmlLength: number;
  readonly listingUrlCount: number;
}

export interface CollectSearchOptions {
  readonly debug?: boolean;
  readonly outputDir?: string;
  /** Max wait for results or antibot interstitial (ms). */
  readonly waitTimeoutMs?: number;
  readonly log?: (line: string) => void;
}

/**
 * Collect listing URLs from the first page of an Etsy search results page.
 *
 * Waits until listing cards render — or until an anti-bot page is detected.
 * Does not silently return [] when blocked: throws {@link AntiBotError}.
 */
export async function collectSearchListingUrls(
  page: Page,
  searchUrl: string,
  options: CollectSearchOptions = {},
): Promise<string[]> {
  const log = options.log ?? (() => undefined);
  const waitTimeoutMs = options.waitTimeoutMs ?? 30_000;
  const outputDir = options.outputDir;

  await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60_000 });

  const ready = await waitForSearchReady(page, waitTimeoutMs);
  const html = await page.content();
  const pageTitle = await page.title();
  const currentUrl = page.url();
  const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 4000) ?? '');

  const antiBot = detectAntiBot({ html, title: pageTitle, bodyText, url: currentUrl });
  const extraction = extractListingUrlsFromHtml(html);

  const debugInfo: SearchScrapeDebugInfo = {
    pageTitle,
    currentUrl,
    listingCardCount: extraction.cardCount,
    selectorUsed: extraction.selectorUsed,
    antiBotDetected: antiBot.detected,
    antiBotProvider: antiBot.provider,
    htmlLength: html.length,
    listingUrlCount: extraction.urls.length,
  };

  if (options.debug) {
    printDebug(debugInfo, log);
    log(`[debug] wait outcome: ${ready}`);
    log(`[debug] strategies tried: ${extraction.strategiesTried.join(', ')}`);
  }

  if (antiBot.detected) {
    const debugPath = await saveDebugHtml(html, outputDir);
    throw new AntiBotError(
      [
        `Etsy anti-bot / verification page detected (${antiBot.provider ?? 'unknown'}).`,
        'Search results were not rendered, so no listings could be collected.',
        antiBot.signals.length > 0 ? `Signals: ${antiBot.signals.join('; ')}.` : '',
        debugPath ? `Saved page HTML to ${debugPath} for inspection.` : '',
        'Try again from a residential network, with a non-automated browser profile, or use EverBee.',
      ]
        .filter(Boolean)
        .join('\n'),
      antiBot,
      debugPath,
    );
  }

  if (extraction.urls.length === 0) {
    const debugPath = await saveDebugHtml(html, outputDir);
    throw new SearchEmptyError(
      [
        'No Etsy listing cards were found on the search results page after waiting for render.',
        `Page title: ${pageTitle}`,
        `URL: ${currentUrl}`,
        debugPath ? `Saved page HTML to ${debugPath} for selector debugging.` : '',
      ]
        .filter(Boolean)
        .join('\n'),
      debugPath,
    );
  }

  return [...extraction.urls];
}

type ReadyOutcome = 'listings' | 'anti-bot' | 'timeout';

async function waitForSearchReady(page: Page, timeoutMs: number): Promise<ReadyOutcome> {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const snapshot = await page.evaluate(() => {
      const html = document.documentElement.outerHTML;
      const listingAnchors = document.querySelectorAll('a[href*="/listing/"]').length;
      const listingIds = document.querySelectorAll('[data-listing-id]').length;
      const v2Cards = document.querySelectorAll('.v2-listing-card').length;
      const hasCaptcha =
        !!document.querySelector(
          'iframe[src*="captcha-delivery"], script[src*="captcha-delivery"]',
        ) ||
        /datadome|captcha-delivery/i.test(html) ||
        (document.title.trim().toLowerCase() === 'etsy.com' && html.length < 5000);
      return {
        listingSignals: listingAnchors + listingIds + v2Cards,
        hasCaptcha,
      };
    });

    if (snapshot.hasCaptcha) {
      return 'anti-bot';
    }
    if (snapshot.listingSignals > 0) {
      // Give client-side hydration a brief moment to finish appending cards
      await delay(500);
      return 'listings';
    }

    await delay(400);
  }

  try {
    await page.waitForLoadState('networkidle', { timeout: 3_000 });
  } catch {
    // ignore — networkidle is optional
  }

  return 'timeout';
}

function printDebug(info: SearchScrapeDebugInfo, log: (line: string) => void): void {
  log(`[debug] page title: ${info.pageTitle}`);
  log(`[debug] current URL: ${info.currentUrl}`);
  log(`[debug] number of listing cards detected: ${info.listingCardCount}`);
  log(`[debug] selector used: ${info.selectorUsed}`);
  log(
    `[debug] whether anti-bot was detected: ${info.antiBotDetected ? `yes (${info.antiBotProvider ?? 'unknown'})` : 'no'}`,
  );
  log(`[debug] listing URLs extracted: ${info.listingUrlCount}`);
  log(`[debug] html length: ${info.htmlLength}`);
}

async function saveDebugHtml(html: string, outputDir?: string): Promise<string | undefined> {
  if (!outputDir) {
    return undefined;
  }
  await mkdir(outputDir, { recursive: true });
  const path = join(outputDir, 'debug.html');
  await writeFile(path, html, 'utf8');
  return path;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
