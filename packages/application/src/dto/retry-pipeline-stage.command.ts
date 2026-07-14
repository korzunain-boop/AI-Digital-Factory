import type { JobId, PipelineStage } from '@ai-product-factory/domain';

/**
 * Command to retry a single pipeline stage independently (SYSTEM.md).
 */
export interface RetryPipelineStageCommand {
  readonly jobId: JobId;
  readonly stage: PipelineStage;
}
