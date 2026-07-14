import type { Job, JobId } from '@ai-product-factory/domain';

/**
 * Application port for Job persistence.
 *
 * Responsibility: load/save Job aggregates for orchestration use cases.
 * Infrastructure will implement this later (no DB/filesystem in M3).
 *
 * Application services depend on this interface — never on a concrete store.
 */
export interface JobRepository {
  /**
   * Persist a new or updated Job.
   */
  save(job: Job): Promise<void>;

  /**
   * Load a Job by id, or return undefined when missing.
   */
  findById(id: JobId): Promise<Job | undefined>;
}
