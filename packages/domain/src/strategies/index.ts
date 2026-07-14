/**
 * Generator Strategy contracts, registry, test fake (M4), and Clipart commercial strategy (M6–M7).
 */
export type { GeneratorStrategy, GeneratorStrategyRegistry } from './generator-strategy.js';
export { InMemoryGeneratorStrategyRegistry } from './in-memory-generator-strategy-registry.js';
export { FakeGeneratorStrategy } from './fake-generator-strategy.js';
export type { ClipartGeneratorTemplate } from './clipart/index.js';
export {
  CLIPART_STRATEGY_KEY,
  parseClipartTemplate,
  toClipartTemplateParams,
  ClipartGeneratorStrategy,
  assembleClipartAssetBundle,
} from './clipart/index.js';
