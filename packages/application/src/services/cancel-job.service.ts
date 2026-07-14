import type { Job } from '@ai-product-factory/domain';

import type { CancelJobCommand } from '../dto/cancel-job.command.js';
import { NotImplementedError } from '../errors/not-implemented-error.js';
import type { JobRepository } from '../ports/job-repository.js';

/**
 * CancelJob — Application use case.
 *
 * Responsibility:
 *   Mark a Job as cancelled and stop further stage progression.
 *   Future implementation may cooperatively interrupt an in-flight stage if supported.
 *
 * Inputs:
 *   CancelJobCommand — jobId.
 *
 * Outputs:
 *   Job — Job with status `cancelled`.
 *
 * Future role in the pipeline:
 *   Operator control from Dashboard queue / running jobs. Does not delete artifacts;
 *   leaves history for audits.
 *
 * M3: orchestration contract only — throws NotImplementedError.
 */
export class CancelJobService {
  constructor(private readonly jobs: JobRepository) {
    void this.jobs;
  }

  /**
   * Cancel the Job and persist the cancelled status (when implemented).
   */
  async execute(command: CancelJobCommand): Promise<Job> {
    void command;
    throw new NotImplementedError('CancelJobService.execute');
  }
}
