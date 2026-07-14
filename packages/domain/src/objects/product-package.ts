import type { AssetBundleId, ProductPackageId, ResearchBriefId, StorageLocation } from './ids.js';
import type { ListingMetadataDraft, PackageFile } from './listing-metadata.js';

/**
 * Assembled sellable unit ready for QA.
 * Created by Assembler from an AssetBundle (+ brief/template metadata).
 */
export interface ProductPackage {
  /** Stable identifier for this package. */
  readonly id: ProductPackageId;

  /** Source asset bundle. */
  readonly assetBundleId: AssetBundleId;

  /** Related research brief, when known. */
  readonly researchBriefId?: ResearchBriefId;

  /** Organized package files (contents to ship). */
  readonly files: readonly PackageFile[];

  /** Primary ZIP archive location, when created. */
  readonly zipLocation?: StorageLocation;

  /** Preview image locations. */
  readonly previewLocations: readonly StorageLocation[];

  /** Draft listing metadata (title, tags, description). */
  readonly listing: ListingMetadataDraft;

  /** Optional PDF location when required by the product format. */
  readonly pdfLocation?: StorageLocation;

  /** ISO-8601 creation timestamp. */
  readonly createdAt: string;
}
