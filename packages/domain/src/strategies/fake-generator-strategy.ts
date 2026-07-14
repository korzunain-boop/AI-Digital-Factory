import type { GenerationRequest, GenerationResult } from '../objects/index.js';
import type { StrategyKey } from '../objects/ids.js';
import type { GeneratorStrategy } from './generator-strategy.js';

/**
 * Fake GeneratorStrategy for Engine unit tests only.
 *
 * Purpose:
 *   Exercise GeneratorEngine registration and execution without AI, images,
 *   filesystem, or marketplace behavior.
 *
 * Behavior:
 *   Returns a minimal valid GenerationSuccess with a deterministic assetBundleId.
 *   Optional `failWith` / `throwError` hooks support negative Engine tests.
 *
 * Not for production and not a product category (no Clipart/Planner/etc.).
 */
export class FakeGeneratorStrategy implements GeneratorStrategy {
  readonly key: StrategyKey;

  /**
   * When set, generate() returns GenerationFailure with this message (no throw).
   */
  readonly failWith?: string;

  /**
   * When set, generate() throws this error (Engine must map to Domain failure).
   */
  readonly throwError?: Error;

  /**
   * Counts invocations — used to assert Engine is not carrying run state incorrectly.
   */
  invocationCount = 0;

  constructor(
    options: {
      key?: StrategyKey;
      failWith?: string;
      throwError?: Error;
    } = {},
  ) {
    this.key = options.key ?? 'fake';
    this.failWith = options.failWith;
    this.throwError = options.throwError;
  }

  /**
   * Produce a minimal GenerationResult for the given request.
   */
  async generate(request: GenerationRequest): Promise<GenerationResult> {
    this.invocationCount += 1;

    if (this.throwError) {
      throw this.throwError;
    }

    if (this.failWith !== undefined) {
      return {
        ok: false,
        generationRequestId: request.id,
        errors: [this.failWith],
        approximateCost: 0,
      };
    }

    return {
      ok: true,
      generationRequestId: request.id,
      assetBundleId: `fake-bundle-${request.id}`,
      approximateCost: 0,
    };
  }
}
