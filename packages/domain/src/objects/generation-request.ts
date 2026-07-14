import type { GeneratorTemplateParams } from './generator-template.js';
import type { GenerationRequestId, ResearchBriefId, StrategyKey } from './ids.js';

/**
 * Instruction to the Generator Engine.
 * Created by Application when a job enters the Generate stage.
 * Treated as immutable after the Engine starts executing it.
 */
export interface GenerationRequest {
  /** Stable identifier for this request. */
  readonly id: GenerationRequestId;

  /** Product-agnostic strategy key resolved by the Engine registry. */
  readonly strategyKey: StrategyKey;

  /** Research brief this generation is based on. */
  readonly researchBriefId: ResearchBriefId;

  /** Template / niche parameters for the selected strategy. */
  readonly template: GeneratorTemplateParams;

  /** Soft/hard limits (cost caps, asset counts, timeouts as opaque numbers). */
  readonly limits: GenerationLimits;

  /** ISO-8601 creation timestamp. */
  readonly createdAt: string;
}

/**
 * Generation bounds passed to strategies via the request.
 * Engine does not interpret product meaning — strategies enforce what they need.
 */
export interface GenerationLimits {
  /** Optional maximum approximate cost units (currency-agnostic number). */
  readonly maxCost?: number;

  /** Optional maximum number of assets to produce. */
  readonly maxAssets?: number;

  /** Optional timeout hint in milliseconds. */
  readonly timeoutMs?: number;
}
