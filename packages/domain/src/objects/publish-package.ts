import type { ProductPackageId, PublishPackageId, StorageLocation } from './ids.js';

/**
 * Publisher mode.
 * MVP uses export; marketplace automation is a later adapter behind the same contract.
 */
export type PublishMode = 'export' | 'marketplace';

/**
 * Export- or publish-ready artifact produced by Publisher.
 */
export interface PublishPackage {
  /** Stable identifier for this publish artifact. */
  readonly id: PublishPackageId;

  /** Source product package (must be QA-passed for normal flow). */
  readonly productPackageId: ProductPackageId;

  /** How this package was produced. */
  readonly mode: PublishMode;

  /** Primary delivery location (export folder/ZIP URI, or marketplace listing ref). */
  readonly location: StorageLocation;

  /** Manifest of included paths / listing field snapshots. */
  readonly manifest: PublishManifest;

  /** Optional external marketplace listing id when mode is marketplace. */
  readonly externalListingId?: string;

  /** ISO-8601 creation timestamp. */
  readonly createdAt: string;
}

/**
 * Lightweight manifest attached to a PublishPackage.
 */
export interface PublishManifest {
  readonly entries: readonly PublishManifestEntry[];
  readonly notes?: string;
}

/**
 * One manifest entry (file or logical listing artifact).
 */
export interface PublishManifestEntry {
  readonly name: string;
  readonly location: StorageLocation;
  readonly role?: string;
}
