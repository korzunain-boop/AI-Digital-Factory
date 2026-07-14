/**
 * @ai-product-factory/domain
 *
 * Domain contracts and Generator Engine implementation (through Milestone M4).
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
export type { GeneratorStrategy, GeneratorStrategyRegistry } from './strategies/index.js';
export { InMemoryGeneratorStrategyRegistry, FakeGeneratorStrategy } from './strategies/index.js';
export type { AssembleInput, Assembler } from './assembler/index.js';
export type { QA } from './qa/index.js';
export type { PublishInput, Publisher } from './publisher/index.js';
export type * from './providers/index.js';
