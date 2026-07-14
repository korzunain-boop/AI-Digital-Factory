import type { AssetItem } from './asset-item.js';
import type { AssetBundleId, GenerationRequestId } from './ids.js';

/**
 * Raw generated assets produced by a GeneratorStrategy.
 * Input to Assembler; may be reused on Assembler retry without regenerating.
 */
export interface AssetBundle {
  /** Stable identifier for this bundle. */
  readonly id: AssetBundleId;

  /** Generation request that produced this bundle. */
  readonly generationRequestId: GenerationRequestId;

  /** Ordered list of raw assets. */
  readonly assets: readonly AssetItem[];

  /** Optional bundle-level metadata from the strategy. */
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;

  /** ISO-8601 creation timestamp. */
  readonly createdAt: string;
}
