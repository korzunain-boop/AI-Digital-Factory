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
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    locale: 'en-US',
    viewport: { width: 1440, height: 900 },
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    },
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
  });
  const page = await context.newPage();
  return { browser, context, page };
};

export async function closeSession(session: BrowserSession): Promise<void> {
  await session.context.close();
  await session.browser.close();
}
