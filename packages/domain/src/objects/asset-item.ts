import type { StorageLocation } from './ids.js';

/**
 * A single raw asset inside an AssetBundle.
 * Not a sellable listing artifact — packaging is Assembler's job.
 */
export interface AssetItem {
  /** Logical name within the bundle (e.g. file base name). */
  readonly name: string;

  /** MIME or logical media type (e.g. image/png, application/pdf). */
  readonly mediaType: string;

  /** Where the bytes live (interpreted by StorageProvider). */
  readonly location: StorageLocation;

  /** Optional asset-level metadata (dimensions, prompt id, etc.). */
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
}
