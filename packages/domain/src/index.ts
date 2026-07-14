/**
 * @ai-product-factory/domain
 *
 * Domain contracts, Generator Engine (M4), and Clipart commercial strategy skeleton (M6).
 * No provider adapters, marketplace, filesystem, or AI SDK usage.
 */

export type * from './objects/index.js';
export type { DomainErrorCode } from './errors/index.js';
export {
  DomainError,
  DomainErrorCodes,
  formatDomainError,
  generationFailureFromDomainError,
} from './errors/index.js';
export type { GeneratorEngine } from './engine/index.js';
export { DefaultGeneratorEngine } from './engine/index.js';
export type {
  GeneratorStrategy,
  GeneratorStrategyRegistry,
  ClipartGeneratorTemplate,
} from './strategies/index.js';
export {
  InMemoryGeneratorStrategyRegistry,
  FakeGeneratorStrategy,
  CLIPART_STRATEGY_KEY,
  parseClipartTemplate,
  toClipartTemplateParams,
  ClipartGeneratorStrategy,
  buildClipartAssetBundle,
} from './strategies/index.js';
export type { AssembleInput, Assembler } from './assembler/index.js';
export type { QA } from './qa/index.js';
export type { PublishInput, Publisher } from './publisher/index.js';
export type * from './providers/index.js';
