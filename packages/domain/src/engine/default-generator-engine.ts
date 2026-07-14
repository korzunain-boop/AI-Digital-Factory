import {
  DomainError,
  DomainErrorCodes,
  generationFailureFromDomainError,
} from '../errors/index.js';
import type { GenerationRequest, GenerationResult } from '../objects/index.js';
import type { GeneratorEngine } from './generator-engine.js';
import type {
  GeneratorStrategy,
  GeneratorStrategyRegistry,
} from '../strategies/generator-strategy.js';
import { InMemoryGeneratorStrategyRegistry } from '../strategies/in-memory-generator-strategy-registry.js';

function isStrategyList(
  value: readonly GeneratorStrategy[] | GeneratorStrategyRegistry,
): value is readonly GeneratorStrategy[] {
  return Array.isArray(value);
}

/**
 * Default Generator Engine implementation (Milestone M4).
 *
 * Responsibility:
 *   Product-agnostic orchestration of strategy selection and execution.
 *   Accept GenerationRequest → resolve GeneratorStrategy by key → execute → GenerationResult.
 *
 * Design:
 *   - Strategies are injected via constructor (list or registry) — Engine never imports concrete generators.
 *   - Unknown strategy keys produce a Domain GenerationFailure (UNKNOWN_STRATEGY), not a generic throw.
 *   - Unexpected strategy exceptions are caught and returned as STRATEGY_EXECUTION_FAILED failures.
 *   - Stateless between executions: no request-scoped fields mutated on the Engine instance.
 *
 * Non-goals:
 *   No Clipart/Planner/Coloring Book logic, providers, marketplace, filesystem, or AI.
 */
export class DefaultGeneratorEngine implements GeneratorEngine {
  private readonly registry: GeneratorStrategyRegistry;

  /**
   * @param strategiesOrRegistry Either a list of GeneratorStrategy implementations
   *                             or a pre-built GeneratorStrategyRegistry.
   */
  constructor(strategiesOrRegistry: readonly GeneratorStrategy[] | GeneratorStrategyRegistry) {
    this.registry = isStrategyList(strategiesOrRegistry)
      ? new InMemoryGeneratorStrategyRegistry(strategiesOrRegistry)
      : strategiesOrRegistry;
  }

  /**
   * Registered strategy keys (for tests / operator diagnostics).
   */
  registeredKeys(): readonly string[] {
    return this.registry.keys();
  }

  /**
   * Execute a generation request via the registered strategy for `request.strategyKey`.
   */
  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const strategy = this.registry.get(request.strategyKey);

    if (!strategy) {
      return generationFailureFromDomainError(
        request.id,
        new DomainError(
          DomainErrorCodes.UNKNOWN_STRATEGY,
          `No GeneratorStrategy registered for key "${request.strategyKey}"`,
        ),
      );
    }

    try {
      return await strategy.generate(request);
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : 'Strategy execution failed with a non-Error throw';

      return generationFailureFromDomainError(
        request.id,
        new DomainError(DomainErrorCodes.STRATEGY_EXECUTION_FAILED, message),
      );
    }
  }
}
