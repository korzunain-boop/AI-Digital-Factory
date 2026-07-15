/**
 * Normalized Etsy listing record produced by this research tool.
 * Independent of AI Factory domain types — do not import factory packages.
 */
export interface EtsyListing {
  readonly title: string | null;
  readonly price: number | null;
  readonly currency: string | null;
  readonly rating: number | null;
  readonly reviewCount: number | null;
  readonly shopName: string | null;
  readonly description: string | null;
  readonly imageUrls: readonly string[];
  readonly categoryBreadcrumb: readonly string[];
  readonly listingUrl: string;
}

/**
 * Raw fields scraped from a page before normalization.
 * Strings may include currency symbols, sparse whitespace, etc.
 */
export interface RawListingData {
  readonly listingUrl?: string | null;
  readonly title?: string | null;
  readonly priceText?: string | null;
  readonly price?: number | string | null;
  readonly currency?: string | null;
  readonly ratingText?: string | null;
  readonly rating?: number | string | null;
  readonly reviewCountText?: string | null;
  readonly reviewCount?: number | string | null;
  readonly shopName?: string | null;
  readonly description?: string | null;
  readonly imageUrls?: readonly (string | null | undefined)[] | null;
  readonly categoryBreadcrumb?: readonly (string | null | undefined)[] | null;
  readonly breadcrumbText?: string | null;
}

export interface ResearchResult {
  readonly source: 'listing' | 'search';
  readonly queriedAt: string;
  readonly input: string;
  readonly listingCount: number;
  readonly listings: readonly EtsyListing[];
}

export type UrlKind = 'listing' | 'search' | 'unknown';
