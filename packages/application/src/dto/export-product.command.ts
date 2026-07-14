import type { JobId, ProductPackageId } from '@ai-product-factory/domain';

/**
 * Command to export a QA-passed product via Publisher export mode.
 * Accepts either a Job context or an explicit ProductPackage id.
 */
export interface ExportProductCommand {
  /** Prefer exporting from Job when package linkage is already on the Job. */
  readonly jobId?: JobId;

  /** Explicit package when exporting outside an active Job run. */
  readonly productPackageId?: ProductPackageId;
}
