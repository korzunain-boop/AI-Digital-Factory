import type { GenerationRequest, GenerationResult } from '../objects/index.js';
import type { StrategyKey } from '../objects/ids.js';

/**
 * Strategy Pattern port for product-specific generation.
 *
 * Implementations own all category-specific behavior and templates.
 * Strategies produce assets only (via GenerationResult / AssetBundle) —
 * not ZIPs, listing folders, or marketplace payloads.
 *
 * Strategies may depend on Text/Image/Storage provider ports.
 * Strategies must NOT call MarketplaceProvider.
 *
 * The First Commercial Generator is implemented in M6 — not here.
 */
export interface GeneratorStrategy {
  /** Registry key matched by GenerationRequest.strategyKey. */
  readonly key: StrategyKey;

  /**
   * Produce raw assets for the request.
   * Returns a GenerationResult (success with AssetBundle id, or failure).
   */
  generate(request: GenerationRequest): Promise<GenerationResult>;
}

/**
 * Registry port used by the Engine to resolve strategies by key.
 * Composition root wires concrete strategies later — empty contract for M2.
 */
export interface GeneratorStrategyRegistry {
  /**
   * Resolve a strategy by key, or return undefined if none registered.
   */
  get(key: StrategyKey): GeneratorStrategy | undefined;

  /**
   * List registered strategy keys (operator/debug).
   */
  keys(): readonly StrategyKey[];
}
