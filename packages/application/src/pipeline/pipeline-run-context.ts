import type { GenerationRequest, Job, ResearchIngestInput } from '@ai-product-factory/domain';

/**
 * Mutable-through-copies context carried across pipeline stages in a single run.
 * PipelineExecutor updates Job; stage runners read request/research inputs.
 */
export interface PipelineRunContext {
  /** Job being executed (updated after each stage). */
  job: Job;

  /**
   * Generation request for the Generator stage.
   * Required for GeneratorEngine — Application builds this before/while running the pipeline.
   */
  readonly generationRequest: GenerationRequest;

  /**
   * Optional research ingest payload for the Research stage.
   * Ignored by NotImplemented research placeholders.
   */
  readonly researchInput?: ResearchIngestInput;
}
