import type {
  Assembler,
  GeneratorEngine,
  Job,
  Publisher,
  QA,
  ResearchProvider,
} from '@ai-product-factory/domain';

import type { PipelineRunContext } from './pipeline-run-context.js';
import {
  applyStageResult,
  ensureJobStages,
  finalizeJobStatus,
  pipelineStageOrder,
  skipRemainingStages,
} from './job-stage-updates.js';
import type { PipelineStageRunner } from './pipeline-stage-runner.js';
import { stageSkipped } from './stage-result.js';
import { GeneratorStageRunner } from './stages/generator-stage-runner.js';
import {
  AssemblerStageRunner,
  PublisherStageRunner,
  QAStageRunner,
  ResearchStageRunner,
} from './stages/placeholder-stage-runners.js';

/**
 * PipelineExecutor — Application orchestration skeleton (Milestone M5).
 *
 * Responsibility:
 *   Drive a Job through Research → Generator → Assembler → QA → Publisher.
 *   Stop on the first Failure; mark later stages Skipped; return the updated Job.
 *
 * Design:
 *   - Stage runners are ordered in an array — no product-type switches.
 *   - Generator is the only executable stage (via GeneratorEngine).
 *   - Research / Assembler / QA / Publisher use placeholder Domain-port implementations
 *     that return NotImplemented (as StageFailure) until later milestones.
 *   - Product-agnostic: never inspects Clipart/Planner/ColoringBook categories.
 *
 * Non-goals (M5):
 *   No AI, images, OpenAI, marketplace, filesystem, or real provider adapters.
 */
export class PipelineExecutor {
  private readonly runners: readonly PipelineStageRunner[];

  /**
   * @param deps Domain ports. Prefer NotImplemented* placeholders for non-generator stages in M5.
   * @param runners Optional override of stage runner list (tests / future composition).
   *                When omitted, builds the canonical ordered runners from deps.
   */
  constructor(
    deps: {
      research: ResearchProvider;
      engine: GeneratorEngine;
      assembler: Assembler;
      qa: QA;
      publisher: Publisher;
    },
    runners?: readonly PipelineStageRunner[],
  ) {
    this.runners =
      runners ??
      ([
        new ResearchStageRunner(deps.research),
        new GeneratorStageRunner(deps.engine),
        new AssemblerStageRunner(deps.assembler),
        new QAStageRunner(deps.qa),
        new PublisherStageRunner(deps.publisher),
      ] as const);

    assertCanonicalOrder(this.runners);
  }

  /**
   * Execute the pipeline against the given Job + run context.
   *
   * @returns Updated Job with per-stage Success / Failure / Skipped records.
   */
  async execute(context: PipelineRunContext): Promise<Job> {
    const now = () => new Date().toISOString();
    let job = ensureJobStages({ ...context.job, status: 'running', updatedAt: now() }, now());

    let failed = false;
    let failureReason = 'Earlier stage failed';

    for (const runner of this.runners) {
      const runContext: PipelineRunContext = { ...context, job };

      if (failed) {
        const skipped = stageSkipped(runner.stage, failureReason);
        job = applyStageResult(job, skipped, now());
        continue;
      }

      const result = await runner.run(runContext);
      job = applyStageResult(job, result, now());

      if (result.kind === 'failure') {
        failed = true;
        failureReason = `Stopped after ${result.stage} failure`;
        job = skipRemainingStages(job, result.stage, failureReason, now());
        // Remaining runners still visited to record Skipped explicitly if still pending —
        // skipRemainingStages already marked them; loop continues for clarity/tests.
      }
    }

    return finalizeJobStatus(job, failed, now());
  }

  /**
   * Ordered stage names the executor will run (diagnostics / tests).
   */
  stageOrder(): readonly string[] {
    return this.runners.map((r) => r.stage);
  }
}

function assertCanonicalOrder(runners: readonly PipelineStageRunner[]): void {
  const expected = pipelineStageOrder();
  const actual = runners.map((r) => r.stage);
  if (actual.length !== expected.length || actual.some((s, i) => s !== expected[i])) {
    throw new Error(
      `PipelineExecutor runners must follow canonical order ${expected.join(' → ')}; got ${actual.join(' → ')}`,
    );
  }
}
