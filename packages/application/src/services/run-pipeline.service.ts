import type {
  Assembler,
  GeneratorEngine,
  Job,
  Publisher,
  QA,
  ResearchProvider,
} from '@ai-product-factory/domain';

import type { RunPipelineCommand } from '../dto/run-pipeline.command.js';
import { NotImplementedError } from '../errors/not-implemented-error.js';
import type { JobRepository } from '../ports/job-repository.js';

/**
 * RunPipeline — Application use case.
 *
 * Responsibility:
 *   Orchestrate the full factory pipeline for a Job:
 *   Research → Generator (Engine) → Assembler → QA → Publisher.
 *   Coordinates Domain stage ports only; owns no product-category logic.
 *
 * Inputs:
 *   RunPipelineCommand — jobId of an existing Job.
 *
 * Outputs:
 *   Job — updated Job reflecting terminal stage statuses (succeeded/failed).
 *
 * Future role in the pipeline:
 *   Primary runner after CreateJob. Will advance stages, store intermediate ids on Job
 *   (brief, request, asset bundle, package, QA report, publish package), and support
 *   failure short-circuit. End-to-end behavior lands in later milestones (M11).
 *
 * M3: orchestration contract only — throws NotImplementedError.
 */
export class RunPipelineService {
  constructor(
    private readonly jobs: JobRepository,
    private readonly research: ResearchProvider,
    private readonly engine: GeneratorEngine,
    private readonly assembler: Assembler,
    private readonly qa: QA,
    private readonly publisher: Publisher,
  ) {
    void this.jobs;
    void this.research;
    void this.engine;
    void this.assembler;
    void this.qa;
    void this.publisher;
  }

  /**
   * Run all pipeline stages for the given Job (when implemented).
   */
  async execute(command: RunPipelineCommand): Promise<Job> {
    void command;
    throw new NotImplementedError('RunPipelineService.execute');
  }
}
