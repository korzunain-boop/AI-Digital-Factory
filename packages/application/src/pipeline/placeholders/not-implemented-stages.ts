import type {
  AssembleInput,
  Assembler,
  ProductPackage,
  PublishInput,
  PublishPackage,
  Publisher,
  QA,
  QAReport,
  ResearchBrief,
  ResearchIngestInput,
  ResearchProvider,
} from '@ai-product-factory/domain';

import { NotImplementedError } from '../../errors/not-implemented-error.js';

/**
 * Placeholder ResearchProvider (M5).
 *
 * Responsibility: expose the ResearchProvider contract until a real adapter exists.
 * Always throws NotImplementedError — no CSV/EverBee/AI research behavior.
 */
export class NotImplementedResearchProvider implements ResearchProvider {
  async ingest(input: ResearchIngestInput): Promise<ResearchBrief> {
    void input;
    throw new NotImplementedError('ResearchProvider.ingest');
  }
}

/**
 * Placeholder Assembler (M5).
 *
 * Responsibility: expose the Assembler contract until packaging is implemented.
 * Always throws NotImplementedError — no ZIP/preview/PDF work.
 */
export class NotImplementedAssembler implements Assembler {
  async assemble(input: AssembleInput): Promise<ProductPackage> {
    void input;
    throw new NotImplementedError('Assembler.assemble');
  }
}

/**
 * Placeholder QA (M5).
 *
 * Responsibility: expose the QA contract until validation rules exist.
 * Always throws NotImplementedError.
 */
export class NotImplementedQA implements QA {
  async validate(productPackage: ProductPackage): Promise<QAReport> {
    void productPackage;
    throw new NotImplementedError('QA.validate');
  }
}

/**
 * Placeholder Publisher (M5).
 *
 * Responsibility: expose the Publisher contract until export/publish are implemented.
 * Always throws NotImplementedError — no filesystem export or marketplace calls.
 */
export class NotImplementedPublisher implements Publisher {
  async publish(input: PublishInput): Promise<PublishPackage> {
    void input;
    throw new NotImplementedError('Publisher.publish');
  }
}
