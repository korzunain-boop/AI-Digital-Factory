import type {
  Assembler,
  GeneratorEngine,
  Job,
  Publisher,
  QA,
  ResearchProvider,
} from '@ai-product-factory/domain';

import type { RetryPipelineStageCommand } from '../dto/retry-pipeline-stage.command.js';
import { NotImplementedError } from '../errors/not-implemented-error.js';
import type { JobRepository } from '../ports/job-repository.js';

/**
 * RetryPipelineStage — Application use case.
 *
 * Responsibility:
 *   Re-run a single pipeline stage independently when prior inputs are retained
 *   (SYSTEM.md independent retries). Prefer Assembler retry over regenerating assets.
 *
 * Inputs:
 *   RetryPipelineStageCommand — jobId + PipelineStage to retry.
 *
 * Outputs:
 *   Job — updated Job with that stage's new status and any new linked artifact ids.
 *
 * Future role in the pipeline:
 *   Operator recovery path from Dashboard (running jobs / failures). Must not always
 *   restart from Research/Generator when a later stage failed.
 *
 * M3: orchestration contract only — throws NotImplementedError.
 */
export class RetryPipelineStageService {
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
   * Retry one stage on the Job without requiring a full pipeline restart.
   */
  async execute(command: RetryPipelineStageCommand): Promise<Job> {
    void command;
    throw new NotImplementedError('RetryPipelineStageService.execute');
  }
}
