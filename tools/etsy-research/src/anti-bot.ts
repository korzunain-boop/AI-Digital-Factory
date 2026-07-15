/**
 * Anti-bot / challenge page detection for Etsy scrapes.
 */

export interface AntiBotDetection {
  readonly detected: boolean;
  /** e.g. DataDome, Cloudflare, generic */
  readonly provider: string | null;
  readonly signals: readonly string[];
}

/**
 * Detect CAPTCHA / bot-verification interstitial HTML.
 */
export function detectAntiBot(input: {
  readonly html: string;
  readonly title?: string | null;
  readonly bodyText?: string | null;
  readonly url?: string | null;
}): AntiBotDetection {
  const html = input.html ?? '';
  const title = input.title ?? '';
  const bodyText = input.bodyText ?? '';
  const signals: string[] = [];

  const checks: Array<{ provider: string; pattern: RegExp; label: string }> = [
    {
      provider: 'DataDome',
      pattern: /captcha-delivery\.com|datadome|geo\.captcha-delivery|ct\.captcha-delivery/i,
      label: 'DataDome captcha scripts/iframe',
    },
    {
      provider: 'Cloudflare',
      pattern: /cf-challenge|cdn-cgi\/challenge|just a moment|attention required/i,
      label: 'Cloudflare challenge markers',
    },
    {
      provider: 'Generic',
      pattern: /verify you are human|are you a robot|access denied|bot detection/i,
      label: 'generic bot-check copy',
    },
  ];

  let provider: string | null = null;
  for (const check of checks) {
    if (check.pattern.test(html) || check.pattern.test(bodyText) || check.pattern.test(title)) {
      signals.push(check.label);
      provider = provider ?? check.provider;
    }
  }

  // Tiny shell page with title "etsy.com" is almost always DataDome interstitial
  if (
    title.trim().toLowerCase() === 'etsy.com' &&
    html.length < 5000 &&
    !/\/listing\/\d+/i.test(html)
  ) {
    signals.push('empty etsy.com shell without listings');
    provider = provider ?? 'DataDome';
  }

  return {
    detected: signals.length > 0,
    provider,
    signals,
  };
}

export class AntiBotError extends Error {
  override readonly name = 'AntiBotError';

  constructor(
    message: string,
    readonly detection: AntiBotDetection,
    readonly debugHtmlPath?: string,
  ) {
    super(message);
  }
}

export class SearchEmptyError extends Error {
  override readonly name = 'SearchEmptyError';

  constructor(
    message: string,
    readonly debugHtmlPath?: string,
  ) {
    super(message);
  }
}
