import type { PipelineStage } from '@ai-product-factory/domain';

import type { PipelineRunContext } from './pipeline-run-context.js';
import type { StageResult } from './stage-result.js';

/**
 * Contract for a single pipeline stage runner.
 *
 * Responsibility:
 *   Execute one PipelineStage and return Success | Failure | Skipped language.
 *   Must not contain product-category logic (Clipart/Planner/etc.).
 */
export interface PipelineStageRunner {
  readonly stage: PipelineStage;

  /**
   * Execute this stage against the current run context.
   */
  run(context: PipelineRunContext): Promise<StageResult>;
}
