import type { PublishPackage, Publisher } from '@ai-product-factory/domain';

import type { ExportProductCommand } from '../dto/export-product.command.js';
import { NotImplementedError } from '../errors/not-implemented-error.js';
import type { JobRepository } from '../ports/job-repository.js';

/**
 * ExportProduct — Application use case.
 *
 * Responsibility:
 *   Produce a PublishPackage in **export** mode (MVP Publisher path) for a
 *   QA-passed ProductPackage. Manual marketplace upload remains outside this service.
 *
 * Inputs:
 *   ExportProductCommand — jobId and/or productPackageId.
 *
 * Outputs:
 *   PublishPackage — export artifact (location + manifest).
 *
 * Future role in the pipeline:
 *   Called after QA pass (from RunPipeline or as a standalone export).
 *   Must use Publisher.publish({ mode: 'export' }) — not MarketplaceProvider directly.
 *   Marketplace automation is a later Publisher mode (post Commercial Validation).
 *
 * M3: orchestration contract only — throws NotImplementedError.
 */
export class ExportProductService {
  constructor(
    private readonly jobs: JobRepository,
    private readonly publisher: Publisher,
  ) {
    void this.jobs;
    void this.publisher;
  }

  /**
   * Export a listing package via Publisher export mode (when implemented).
   */
  async execute(command: ExportProductCommand): Promise<PublishPackage> {
    void command;
    throw new NotImplementedError('ExportProductService.execute');
  }
}
