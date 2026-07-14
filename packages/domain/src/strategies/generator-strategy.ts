import type { GenerationRequest, GenerationResult } from '../objects/index.js';
import type { StrategyKey } from '../objects/ids.js';

/**
 * Strategy Pattern port for product-specific generation.
 *
 * Implementations own all category-specific behavior and templates.
 * Strategies produce assets only (via GenerationResult / AssetBundle) —
 * not ZIPs, listing folders, or marketplace payloads.
 *
 * Strategies may depend on Text/Image/Storage provider ports (later milestones).
 * Strategies must NOT call MarketplaceProvider.
 *
 * The Engine resolves strategies by {@link GeneratorStrategy.key} only —
 * it never imports concrete product generators.
 *
 * Production strategies arrive in M6+ (First Commercial Generator).
 * For Engine tests, use {@link FakeGeneratorStrategy}.
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
 * Default: {@link InMemoryGeneratorStrategyRegistry} built from constructor-injected strategies.
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
