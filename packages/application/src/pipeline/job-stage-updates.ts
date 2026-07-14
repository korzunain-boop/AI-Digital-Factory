import type { Job, JobStageRecord, JobStatus, PipelineStage } from '@ai-product-factory/domain';

import type { StageArtifactIds, StageResult } from './stage-result.js';

const PIPELINE_ORDER: readonly PipelineStage[] = [
  'research',
  'generator',
  'assembler',
  'qa',
  'publisher',
] as const;

/**
 * Canonical ordered list of pipeline stages (SYSTEM.md).
 */
export function pipelineStageOrder(): readonly PipelineStage[] {
  return PIPELINE_ORDER;
}

/**
 * Ensure a Job has a stage record for every pipeline stage (pending by default).
 */
export function ensureJobStages(job: Job, now: string): Job {
  const byStage = new Map(job.stages.map((s) => [s.stage, s]));
  const stages: JobStageRecord[] = PIPELINE_ORDER.map((stage) => {
    const existing = byStage.get(stage);
    return (
      existing ?? {
        stage,
        status: 'pending',
        attempts: 0,
        updatedAt: now,
      }
    );
  });
  return { ...job, stages };
}

/**
 * Apply a stage result onto the Job (immutable update).
 */
export function applyStageResult(job: Job, result: StageResult, now: string): Job {
  const stages = job.stages.map((record) => {
    if (record.stage !== result.stage) {
      return record;
    }

    if (result.kind === 'success') {
      return {
        ...record,
        status: 'succeeded' as const,
        attempts: record.attempts + 1,
        errors: undefined,
        updatedAt: now,
      };
    }

    if (result.kind === 'failure') {
      return {
        ...record,
        status: 'failed' as const,
        attempts: record.attempts + 1,
        errors: result.errors,
        updatedAt: now,
      };
    }

    return {
      ...record,
      status: 'skipped' as const,
      updatedAt: now,
      errors: undefined,
    };
  });

  let next: Job = {
    ...job,
    stages,
    currentStage: result.stage,
    updatedAt: now,
  };

  if (result.kind === 'success' && result.artifactIds) {
    next = applyArtifacts(next, result.artifactIds);
  }

  return next;
}

/**
 * Mark all stages still pending after `afterStage` as skipped.
 */
export function skipRemainingStages(
  job: Job,
  afterStage: PipelineStage,
  reason: string,
  now: string,
): Job {
  const index = PIPELINE_ORDER.indexOf(afterStage);
  const stages = job.stages.map((record) => {
    const stageIndex = PIPELINE_ORDER.indexOf(record.stage);
    if (stageIndex > index && record.status === 'pending') {
      return {
        ...record,
        status: 'skipped' as const,
        updatedAt: now,
        errors: [reason],
      };
    }
    return record;
  });

  return { ...job, stages, updatedAt: now };
}

/**
 * Derive aggregate Job status after a full pipeline pass.
 */
export function finalizeJobStatus(job: Job, failed: boolean, now: string): Job {
  const status: JobStatus = failed ? 'failed' : 'succeeded';
  return { ...job, status, updatedAt: now };
}

function applyArtifacts(job: Job, ids: StageArtifactIds): Job {
  return {
    ...job,
    ...(ids.researchBriefId !== undefined ? { researchBriefId: ids.researchBriefId } : {}),
    ...(ids.generationRequestId !== undefined
      ? { generationRequestId: ids.generationRequestId }
      : {}),
    ...(ids.assetBundleId !== undefined ? { assetBundleId: ids.assetBundleId } : {}),
    ...(ids.productPackageId !== undefined ? { productPackageId: ids.productPackageId } : {}),
    ...(ids.qaReportId !== undefined ? { qaReportId: ids.qaReportId } : {}),
    ...(ids.publishPackageId !== undefined ? { publishPackageId: ids.publishPackageId } : {}),
  };
}
