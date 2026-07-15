import type { UrlKind } from './types.js';

const LISTING_PATH = /\/listing\/(\d+)/i;

/**
 * Classify an Etsy URL as listing, search, or unknown.
 */
export function classifyEtsyUrl(input: string): UrlKind {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return 'unknown';
  }

  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  if (host !== 'etsy.com' && !host.endsWith('.etsy.com')) {
    return 'unknown';
  }

  if (LISTING_PATH.test(url.pathname)) {
    return 'listing';
  }

  if (url.pathname.includes('/search') || url.searchParams.has('q')) {
    return 'search';
  }

  return 'unknown';
}

/**
 * Canonical listing URL (strip query/hash tracking params where possible).
 */
export function canonicalizeListingUrl(input: string): string {
  const url = new URL(input.trim());
  const match = url.pathname.match(LISTING_PATH);
  if (!match) {
    return `${url.origin}${url.pathname}`;
  }
  const id = match[1];
  const slugMatch = url.pathname.match(/\/listing\/\d+\/([^/?#]+)/);
  const slug = slugMatch?.[1] ? `/${slugMatch[1]}` : '';
  return `https://www.etsy.com/listing/${id}${slug}`;
}

/**
 * Build an Etsy search URL from a free-text query.
 */
export function buildSearchUrl(query: string): string {
  const q = query.trim();
  if (!q) {
    throw new Error('Search query must not be empty.');
  }
  const url = new URL('https://www.etsy.com/search');
  url.searchParams.set('q', q);
  return url.toString();
}

/**
 * Extract listing id from a listing URL, or null.
 */
export function extractListingId(input: string): string | null {
  try {
    const url = new URL(input.trim());
    const match = url.pathname.match(LISTING_PATH);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}
