import type { JobId } from '@ai-product-factory/domain';

/**
 * Command to cancel a Job.
 */
export interface CancelJobCommand {
  readonly jobId: JobId;
}
