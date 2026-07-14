import type { ProductPackageId, QAReportId } from './ids.js';

/**
 * Severity of a QA finding.
 * Hard failures block publish/export; warnings do not.
 */
export type QAFindingSeverity = 'hard' | 'warning';

/**
 * Single checklist finding on a ProductPackage.
 */
export interface QAFinding {
  readonly code: string;
  readonly message: string;
  readonly severity: QAFindingSeverity;
}

/**
 * Validation outcome of a finished ProductPackage (post-Assembler).
 * Gates Publisher: hard failures block export/publish.
 */
export interface QAReport {
  /** Stable identifier for this report. */
  readonly id: QAReportId;

  /** Package that was validated. */
  readonly productPackageId: ProductPackageId;

  /** True when there are no hard failures. */
  readonly passed: boolean;

  /** Checklist findings. */
  readonly findings: readonly QAFinding[];

  /** ISO-8601 creation timestamp. */
  readonly createdAt: string;
}
