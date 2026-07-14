import type { GeneratorEngine } from '@ai-product-factory/domain';

import type { PipelineRunContext } from '../pipeline-run-context.js';
import type { PipelineStageRunner } from '../pipeline-stage-runner.js';
import { stageFailure, stageSuccess, type StageResult } from '../stage-result.js';

/**
 * Generator pipeline stage runner (M5 — only executable stage).
 *
 * Responsibility:
 *   Invoke GeneratorEngine.generate with the context GenerationRequest.
 *   Engine alone selects the GeneratorStrategy by strategyKey.
 *   This runner never switches on product types.
 */
export class GeneratorStageRunner implements PipelineStageRunner {
  readonly stage = 'generator' as const;

  constructor(private readonly engine: GeneratorEngine) {}

  async run(context: PipelineRunContext): Promise<StageResult> {
    const result = await this.engine.generate(context.generationRequest);

    if (result.ok) {
      return stageSuccess('generator', {
        generationRequestId: result.generationRequestId,
        assetBundleId: result.assetBundleId,
      });
    }

    return stageFailure('generator', result.errors);
  }
}
