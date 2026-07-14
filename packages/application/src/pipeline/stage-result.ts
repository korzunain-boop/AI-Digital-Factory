import type { PipelineStage } from '@ai-product-factory/domain';

/**
 * Standard pipeline stage language (Milestone M5).
 * Every stage runner returns one of these outcomes — Success | Failure | Skipped.
 */
export type StageResult = StageSuccess | StageFailure | StageSkipped;

/**
 * Stage completed successfully.
 */
export interface StageSuccess {
  readonly kind: 'success';
  readonly stage: PipelineStage;
  /** Optional artifact ids produced by this stage. */
  readonly artifactIds?: StageArtifactIds;
}

/**
 * Stage failed; PipelineExecutor must stop and mark later stages skipped.
 */
export interface StageFailure {
  readonly kind: 'failure';
  readonly stage: PipelineStage;
  readonly errors: readonly string[];
}

/**
 * Stage was not executed (typically because an earlier stage failed).
 */
export interface StageSkipped {
  readonly kind: 'skipped';
  readonly stage: PipelineStage;
  readonly reason: string;
}

/**
 * Artifact ids a stage may attach onto the Job.
 * Product-agnostic — no category-specific fields.
 */
export interface StageArtifactIds {
  readonly researchBriefId?: string;
  readonly generationRequestId?: string;
  readonly assetBundleId?: string;
  readonly productPackageId?: string;
  readonly qaReportId?: string;
  readonly publishPackageId?: string;
}

export function stageSuccess(stage: PipelineStage, artifactIds?: StageArtifactIds): StageSuccess {
  return artifactIds ? { kind: 'success', stage, artifactIds } : { kind: 'success', stage };
}

export function stageFailure(stage: PipelineStage, errors: readonly string[]): StageFailure {
  return { kind: 'failure', stage, errors };
}

export function stageSkipped(stage: PipelineStage, reason: string): StageSkipped {
  return { kind: 'skipped', stage, reason };
}
