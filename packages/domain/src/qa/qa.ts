import type { ProductPackage, QAReport } from '../objects/index.js';

/**
 * QA stage contract: validate a finished ProductPackage (post-Assembler).
 * Does not validate raw generator scraps.
 *
 * Hard failures block Publisher; warnings do not.
 * Behavior is implemented later — contract only in M2.
 */
export interface QA {
  /**
   * Validate the package and return a QAReport (including pass/fail gate).
   */
  validate(productPackage: ProductPackage): Promise<QAReport>;
}
