import type { StrategyKey } from '../objects/ids.js';
import type { GeneratorStrategy, GeneratorStrategyRegistry } from './generator-strategy.js';

/**
 * In-memory strategy registry built from constructor-injected strategies.
 * The Engine uses this to stay product-agnostic — it never imports concrete generators.
 */
export class InMemoryGeneratorStrategyRegistry implements GeneratorStrategyRegistry {
  private readonly byKey: ReadonlyMap<StrategyKey, GeneratorStrategy>;

  /**
   * @param strategies Strategies available for this Engine instance (typically wired at composition root).
   *                   Duplicate keys: the last entry wins.
   */
  constructor(strategies: readonly GeneratorStrategy[]) {
    const map = new Map<StrategyKey, GeneratorStrategy>();
    for (const strategy of strategies) {
      map.set(strategy.key, strategy);
    }
    this.byKey = map;
  }

  get(key: StrategyKey): GeneratorStrategy | undefined {
    return this.byKey.get(key);
  }

  keys(): readonly StrategyKey[] {
    return [...this.byKey.keys()];
  }
}
