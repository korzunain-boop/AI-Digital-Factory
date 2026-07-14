import type { AssetBundle } from './asset-bundle.js';
import type { AssetBundleId, GenerationRequestId } from './ids.js';

/**
 * Outcome of Generator Engine (strategy) execution.
 * On success, carries an AssetBundle id for Assembler.
 */
export type GenerationResult = GenerationSuccess | GenerationFailure;

/**
 * Successful generation result.
 */
export interface GenerationSuccess {
  readonly ok: true;

  /** Request that was executed. */
  readonly generationRequestId: GenerationRequestId;

  /** Produced asset bundle id (stable reference for Job / retries). */
  readonly assetBundleId: AssetBundleId;

  /**
   * Full AssetBundle when produced in-memory (e.g. before StorageProvider exists).
   * Future image providers will persist bytes and may omit this, leaving only locations on AssetItems.
   */
  readonly assetBundle?: AssetBundle;

  /** Optional rough cost estimate (currency-agnostic). */
  readonly approximateCost?: number;
}

/**
 * Failed generation result.
 */
export interface GenerationFailure {
  readonly ok: false;

  /** Request that was executed. */
  readonly generationRequestId: GenerationRequestId;

  /** Human-readable error messages for operators / Job failure handling. */
  readonly errors: readonly string[];

  /** Optional rough cost incurred before failure. */
  readonly approximateCost?: number;
}
