import type { EtsyListing, RawListingData } from './types.js';
import { canonicalizeListingUrl } from './urls.js';

/**
 * Normalize raw scraped fields into a stable EtsyListing JSON shape.
 * Pure functions — no Playwright / network.
 */
export function normalizeListing(raw: RawListingData, fallbackUrl: string): EtsyListing {
  const listingUrl = safeCanonicalUrl(raw.listingUrl || fallbackUrl);

  const priceFromNumber = toFiniteNumber(raw.price);
  const priceFromText = parsePrice(raw.priceText);
  const price = priceFromNumber ?? priceFromText;

  const currency =
    cleanText(raw.currency)?.toUpperCase() ??
    parseCurrency(raw.priceText) ??
    (price !== null ? 'USD' : null);

  const rating = toFiniteNumber(raw.rating) ?? parseRating(raw.ratingText);
  const reviewCount = toFiniteNumber(raw.reviewCount) ?? parseReviewCount(raw.reviewCountText);

  const imageUrls = uniqueStrings(
    (raw.imageUrls ?? []).map((u) => cleanUrl(u)).filter((u): u is string => Boolean(u)),
  );

  const breadcrumbFromArray = (raw.categoryBreadcrumb ?? [])
    .map((part) => cleanText(part))
    .filter((part): part is string => Boolean(part));
  const breadcrumbFromText = parseBreadcrumb(raw.breadcrumbText);
  const categoryBreadcrumb =
    breadcrumbFromArray.length > 0 ? breadcrumbFromArray : breadcrumbFromText;

  return {
    title: cleanText(raw.title),
    price,
    currency,
    rating,
    reviewCount,
    shopName: cleanText(raw.shopName),
    description: cleanMultiline(raw.description),
    imageUrls,
    categoryBreadcrumb,
    listingUrl,
  };
}

export function normalizeListings(
  rawItems: readonly RawListingData[],
  fallbackUrl: string,
): EtsyListing[] {
  return rawItems.map((raw) => normalizeListing(raw, fallbackUrl));
}

export function cleanText(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const cleaned = value.replace(/\s+/g, ' ').trim();
  return cleaned.length > 0 ? cleaned : null;
}

export function cleanMultiline(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const cleaned = value
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return cleaned.length > 0 ? cleaned : null;
}

export function toFiniteNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  const cleaned = value.replace(/,/g, '').trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/**
 * Parse price from texts like "$12.99", "USD 12.99", "12,99 €".
 */
export function parsePrice(text: string | null | undefined): number | null {
  const cleaned = cleanText(text);
  if (!cleaned) {
    return null;
  }
  const match = cleaned
    .replace(/\s/g, '')
    .match(/(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)/);
  if (!match?.[1]) {
    return null;
  }
  const n = Number(match[1].replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

export function parseCurrency(text: string | null | undefined): string | null {
  const cleaned = cleanText(text);
  if (!cleaned) {
    return null;
  }
  if (cleaned.includes('$') || /\bUSD\b/i.test(cleaned)) {
    return 'USD';
  }
  if (cleaned.includes('€') || /\bEUR\b/i.test(cleaned)) {
    return 'EUR';
  }
  if (cleaned.includes('£') || /\bGBP\b/i.test(cleaned)) {
    return 'GBP';
  }
  const code = cleaned.match(/\b([A-Z]{3})\b/);
  return code?.[1] ?? null;
}

export function parseRating(text: string | null | undefined): number | null {
  const cleaned = cleanText(text);
  if (!cleaned) {
    return null;
  }
  const match =
    cleaned.match(/(\d+(?:\.\d+)?)\s*(?:out of|\/)\s*5/i) ?? cleaned.match(/^(\d+(?:\.\d+)?)/);
  if (!match?.[1]) {
    return null;
  }
  const n = Number(match[1]);
  if (!Number.isFinite(n) || n < 0 || n > 5) {
    return null;
  }
  return n;
}

/**
 * Parse review counts including compact forms like "(1.2k)".
 */
export function parseReviewCount(text: string | null | undefined): number | null {
  const cleaned = cleanText(text);
  if (!cleaned) {
    return null;
  }
  const compact = cleaned.match(/([\d.]+)\s*k\b/i);
  if (compact?.[1]) {
    const n = Number(compact[1]) * 1000;
    return Number.isFinite(n) ? Math.round(n) : null;
  }
  const digits = cleaned.replace(/[^\d]/g, '');
  if (!digits) {
    return null;
  }
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

export function parseBreadcrumb(text: string | null | undefined): string[] {
  const cleaned = cleanText(text);
  if (!cleaned) {
    return [];
  }
  return cleaned
    .split(/>|›|»|\/|→/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function cleanUrl(value: string | null | undefined): string | null {
  const cleaned = cleanText(value);
  if (!cleaned) {
    return null;
  }
  try {
    const url = new URL(cleaned);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

function uniqueStrings(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    if (!seen.has(value)) {
      seen.add(value);
      out.push(value);
    }
  }
  return out;
}

function safeCanonicalUrl(input: string): string {
  try {
    return canonicalizeListingUrl(input);
  } catch {
    return input.trim();
  }
}
