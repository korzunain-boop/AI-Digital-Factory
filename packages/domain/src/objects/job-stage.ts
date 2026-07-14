/**
 * Pipeline stages matching SYSTEM.md:
 * Research → Generator → Assembler → QA → Publisher
 */
export type PipelineStage = 'research' | 'generator' | 'assembler' | 'qa' | 'publisher';

/**
 * Overall Job lifecycle states from SYSTEM.md.
 */
export type JobStatus = 'pending' | 'running' | 'succeeded' | 'failed' | 'cancelled';

/**
 * Per-stage status enabling independent retries.
 */
export type JobStageStatus = 'pending' | 'running' | 'succeeded' | 'failed' | 'skipped';

/**
 * Status record for one pipeline stage on a Job.
 */
export interface JobStageRecord {
  readonly stage: PipelineStage;
  readonly status: JobStageStatus;
  /** Attempt count for this stage (supports retry accounting). */
  readonly attempts: number;
  /** Last error messages when failed. */
  readonly errors?: readonly string[];
  /** ISO-8601 of last update. */
  readonly updatedAt: string;
}
