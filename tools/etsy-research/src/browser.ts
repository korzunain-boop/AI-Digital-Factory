import type { Browser, BrowserContext, Page } from 'playwright';
import { chromium } from 'playwright';

export interface BrowserSession {
  readonly browser: Browser;
  readonly context: BrowserContext;
  readonly page: Page;
}

/**
 * Launch a short-lived Chromium session for scraping.
 * Injectable factory keeps unit tests free of real browsers.
 */
export type BrowserFactory = () => Promise<BrowserSession>;

export const defaultBrowserFactory: BrowserFactory = async () => {
  const browser = await chromium.launch({
    headless: true,
  });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    locale: 'en-US',
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();
  return { browser, context, page };
};

export async function closeSession(session: BrowserSession): Promise<void> {
  await session.context.close();
  await session.browser.close();
}
