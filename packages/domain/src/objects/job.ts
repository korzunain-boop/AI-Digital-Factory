import type {
  AssetBundleId,
  GenerationRequestId,
  JobId,
  ProductPackageId,
  PublishPackageId,
  QAReportId,
  ResearchBriefId,
} from './ids.js';
import type { JobStageRecord, JobStatus, PipelineStage } from './job-stage.js';

/**
 * Pipeline unit of work.
 * Tracks stage states and links to Brief / Request / Results / Packages / Reports.
 */
export interface Job {
  /** Stable identifier for this job. */
  readonly id: JobId;

  /** Aggregate job status. */
  readonly status: JobStatus;

  /** Stage currently active or last attempted. */
  readonly currentStage: PipelineStage;

  /** Per-stage records for independent retries. */
  readonly stages: readonly JobStageRecord[];

  /** Linked research brief, when available. */
  readonly researchBriefId?: ResearchBriefId;

  /** Linked generation request, when available. */
  readonly generationRequestId?: GenerationRequestId;

  /** Linked asset bundle, when available. */
  readonly assetBundleId?: AssetBundleId;

  /** Linked product package, when available. */
  readonly productPackageId?: ProductPackageId;

  /** Linked QA report, when available. */
  readonly qaReportId?: QAReportId;

  /** Linked publish package, when available. */
  readonly publishPackageId?: PublishPackageId;

  /** ISO-8601 creation timestamp. */
  readonly createdAt: string;

  /** ISO-8601 last update timestamp. */
  readonly updatedAt: string;
}
