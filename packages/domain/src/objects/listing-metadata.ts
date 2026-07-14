import type { StorageLocation } from './ids.js';

/**
 * Draft listing metadata produced by Assembler for a ProductPackage.
 */
export interface ListingMetadataDraft {
  readonly title: string;
  readonly description: string;
  readonly tags: readonly string[];
  /** Optional extra marketplace-agnostic fields. */
  readonly extras?: Readonly<Record<string, string | number | boolean | null>>;
}

/**
 * File entry inside an assembled ProductPackage (organized for sale/export).
 */
export interface PackageFile {
  readonly name: string;
  readonly mediaType: string;
  readonly location: StorageLocation;
  /** Role hint: primary, preview, pdf, zip-member, etc. */
  readonly role?: string;
}
