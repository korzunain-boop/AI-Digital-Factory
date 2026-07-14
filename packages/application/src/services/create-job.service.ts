import type { Job, ResearchProvider } from '@ai-product-factory/domain';

import type { CreateJobCommand } from '../dto/create-job.command.js';
import { NotImplementedError } from '../errors/not-implemented-error.js';
import type { JobRepository } from '../ports/job-repository.js';

/**
 * CreateJob — Application use case.
 *
 * Responsibility:
 *   Create a new pipeline Job from research input + strategy key + template params.
 *   Future implementation will ingest research (ResearchProvider), initialize Job stage
 *   records (Research → Generator → Assembler → QA → Publisher), and persist via JobRepository.
 *
 * Inputs:
 *   CreateJobCommand — strategyKey, research ingest payload, template, optional limits.
 *
 * Outputs:
 *   Job — newly created domain Job (pending).
 *
 * Future role in the pipeline:
 *   Entry point before RunPipeline. Operator/Dashboard (M8) will call this to enqueue work.
 *   Does not run stages itself.
 *
 * M3: orchestration contract only — throws NotImplementedError.
 */
export class CreateJobService {
  constructor(
    private readonly jobs: JobRepository,
    private readonly research: ResearchProvider,
  ) {
    void this.jobs;
    void this.research;
  }

  /**
   * Create and persist a pending Job for later pipeline execution.
   */
  async execute(command: CreateJobCommand): Promise<Job> {
    void command;
    throw new NotImplementedError('CreateJobService.execute');
  }
}
