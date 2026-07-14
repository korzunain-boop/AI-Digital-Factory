import type { GenerationRequest, GenerationResult } from '../objects/index.js';

/**
 * Product-agnostic Generator Engine contract.
 *
 * Responsibilities ONLY:
 * 1. Receive a GenerationRequest
 * 2. Select the proper GeneratorStrategy by strategyKey
 * 3. Execute it
 * 4. Return a GenerationResult
 *
 * Must never contain category-specific logic (Clipart, Planner, Coloring Book, etc.).
 * Must never call Marketplace providers.
 *
 * Concrete implementation: {@link DefaultGeneratorEngine} (Milestone M4).
 */
export interface GeneratorEngine {
  /**
   * Execute a generation request via the registered strategy.
   */
  generate(request: GenerationRequest): Promise<GenerationResult>;
}
