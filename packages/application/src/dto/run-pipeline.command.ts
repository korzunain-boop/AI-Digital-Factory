import type { JobId } from '@ai-product-factory/domain';

/**
 * Command to run the full pipeline for an existing Job.
 */
export interface RunPipelineCommand {
  readonly jobId: JobId;
}
