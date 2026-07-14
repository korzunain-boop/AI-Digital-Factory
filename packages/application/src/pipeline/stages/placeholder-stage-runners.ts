import type { Assembler, Publisher, QA, ResearchProvider } from '@ai-product-factory/domain';

import { NotImplementedError } from '../../errors/not-implemented-error.js';
import type { PipelineRunContext } from '../pipeline-run-context.js';
import type { PipelineStageRunner } from '../pipeline-stage-runner.js';
import { stageFailure, stageSuccess, type StageResult } from '../stage-result.js';

/**
 * Research stage runner — delegates to ResearchProvider.
 * Placeholder providers throw NotImplementedError → returned as StageFailure.
 */
export class ResearchStageRunner implements PipelineStageRunner {
  readonly stage = 'research' as const;

  constructor(private readonly research: ResearchProvider) {}

  async run(context: PipelineRunContext): Promise<StageResult> {
    try {
      const input = context.researchInput ?? {
        kind: 'manual',
        payload: {},
      };
      const brief = await this.research.ingest(input);
      return stageSuccess('research', { researchBriefId: brief.id });
    } catch (error) {
      return failureFromError('research', error);
    }
  }
}

/**
 * Assembler stage runner — delegates to Assembler port.
 * M5 placeholder throws NotImplementedError → StageFailure (stops pipeline after Generator).
 */
export class AssemblerStageRunner implements PipelineStageRunner {
  readonly stage = 'assembler' as const;

  constructor(private readonly assembler: Assembler) {}

  async run(context: PipelineRunContext): Promise<StageResult> {
    try {
      const assetBundleId = context.job.assetBundleId;
      if (!assetBundleId) {
        return stageFailure('assembler', [
          'ASSEMBLER_PRECONDITION: Job has no assetBundleId from Generator',
        ]);
      }

      // Minimal AssetBundle stub for contract call — real Assembler arrives in later milestones.
      // Placeholder throws before using these fields; keeps Domain assemble() signature satisfied.
      const productPackage = await this.assembler.assemble({
        assetBundle: {
          id: assetBundleId,
          generationRequestId: context.generationRequest.id,
          assets: [],
          createdAt: context.job.updatedAt,
        },
      });

      return stageSuccess('assembler', { productPackageId: productPackage.id });
    } catch (error) {
      return failureFromError('assembler', error);
    }
  }
}

/**
 * QA stage runner — delegates to QA port (NotImplemented in M5).
 */
export class QAStageRunner implements PipelineStageRunner {
  readonly stage = 'qa' as const;

  constructor(private readonly qa: QA) {}

  async run(context: PipelineRunContext): Promise<StageResult> {
    try {
      const productPackageId = context.job.productPackageId;
      if (!productPackageId) {
        return stageFailure('qa', ['QA_PRECONDITION: Job has no productPackageId']);
      }

      const report = await this.qa.validate({
        id: productPackageId,
        assetBundleId: context.job.assetBundleId ?? 'unknown',
        files: [],
        previewLocations: [],
        listing: { title: '', description: '', tags: [] },
        createdAt: context.job.updatedAt,
      });

      if (!report.passed) {
        return stageFailure(
          'qa',
          report.findings.filter((f) => f.severity === 'hard').map((f) => f.message),
        );
      }

      return stageSuccess('qa', { qaReportId: report.id });
    } catch (error) {
      return failureFromError('qa', error);
    }
  }
}

/**
 * Publisher stage runner — delegates to Publisher port (NotImplemented in M5).
 */
export class PublisherStageRunner implements PipelineStageRunner {
  readonly stage = 'publisher' as const;

  constructor(private readonly publisher: Publisher) {}

  async run(context: PipelineRunContext): Promise<StageResult> {
    try {
      const productPackageId = context.job.productPackageId;
      if (!productPackageId) {
        return stageFailure('publisher', ['PUBLISHER_PRECONDITION: Job has no productPackageId']);
      }

      const published = await this.publisher.publish({
        mode: 'export',
        productPackage: {
          id: productPackageId,
          assetBundleId: context.job.assetBundleId ?? 'unknown',
          files: [],
          previewLocations: [],
          listing: { title: '', description: '', tags: [] },
          createdAt: context.job.updatedAt,
        },
      });

      return stageSuccess('publisher', { publishPackageId: published.id });
    } catch (error) {
      return failureFromError('publisher', error);
    }
  }
}

function failureFromError(
  stage: 'research' | 'assembler' | 'qa' | 'publisher',
  error: unknown,
): StageResult {
  if (error instanceof NotImplementedError) {
    return stageFailure(stage, [`NOT_IMPLEMENTED: ${error.message}`]);
  }
  const message = error instanceof Error ? error.message : 'Unknown stage error';
  return stageFailure(stage, [message]);
}
