import type {
  GenerationLimits,
  GeneratorTemplateParams,
  ResearchIngestInput,
  StrategyKey,
} from '@ai-product-factory/domain';

/**
 * Command to create a pipeline Job.
 * Composes Domain types — avoids a parallel object model.
 */
export interface CreateJobCommand {
  /** Strategy key for the Generate stage (product-agnostic). */
  readonly strategyKey: StrategyKey;

  /** Research ingest payload for the Research stage. */
  readonly research: ResearchIngestInput;

  /** Template params passed through to GenerationRequest later. */
  readonly template: GeneratorTemplateParams;

  /** Optional generation limits. */
  readonly limits?: GenerationLimits;
}
