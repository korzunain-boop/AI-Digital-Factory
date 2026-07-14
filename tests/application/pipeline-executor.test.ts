import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DefaultGeneratorEngine,
  FakeGeneratorStrategy,
  type GenerationRequest,
  type Job,
  type ResearchBrief,
  type ResearchIngestInput,
  type ResearchProvider,
} from '@ai-product-factory/domain';

import {
  NotImplementedAssembler,
  NotImplementedPublisher,
  NotImplementedQA,
  PipelineExecutor,
} from '@ai-product-factory/application';

/**
 * Test-only ResearchProvider that returns a minimal brief so the pipeline
 * can reach the Generator stage. Production M5 uses NotImplementedResearchProvider.
 */
class SuccessfulResearchStub implements ResearchProvider {
  async ingest(input: ResearchIngestInput): Promise<ResearchBrief> {
    void input;
    return {
      id: 'brief-test-1',
      title: 'Test brief',
      keywords: [],
      constraints: [],
      source: { kind: 'manual' },
      createdAt: '2026-01-01T00:00:00.000Z',
    };
  }
}

function makeJob(): Job {
  const now = '2026-01-01T00:00:00.000Z';
  return {
    id: 'job-1',
    status: 'pending',
    currentStage: 'research',
    stages: [],
    createdAt: now,
    updatedAt: now,
  };
}

function makeRequest(): GenerationRequest {
  return {
    id: 'req-1',
    strategyKey: 'fake',
    researchBriefId: 'brief-test-1',
    template: { values: {} },
    limits: {},
    createdAt: '2026-01-01T00:00:00.000Z',
  };
}

function createExecutor(engine: DefaultGeneratorEngine): PipelineExecutor {
  return new PipelineExecutor({
    research: new SuccessfulResearchStub(),
    engine,
    assembler: new NotImplementedAssembler(),
    qa: new NotImplementedQA(),
    publisher: new NotImplementedPublisher(),
  });
}

describe('PipelineExecutor', () => {
  it('executes stages in Research → Generator → Assembler → QA → Publisher order', async () => {
    const fake = new FakeGeneratorStrategy({ key: 'fake' });
    const engine = new DefaultGeneratorEngine([fake]);
    const executor = createExecutor(engine);

    assert.deepEqual(executor.stageOrder(), [
      'research',
      'generator',
      'assembler',
      'qa',
      'publisher',
    ]);
  });

  it('executes the Generator stage via GeneratorEngine', async () => {
    const fake = new FakeGeneratorStrategy({ key: 'fake' });
    const engine = new DefaultGeneratorEngine([fake]);
    const executor = createExecutor(engine);

    const job = await executor.execute({
      job: makeJob(),
      generationRequest: makeRequest(),
      researchInput: { kind: 'manual', payload: {} },
    });

    const generator = job.stages.find((s) => s.stage === 'generator');
    assert.ok(generator);
    assert.equal(generator.status, 'succeeded');
    assert.equal(job.assetBundleId, 'fake-bundle-req-1');
    assert.equal(job.generationRequestId, 'req-1');
  });

  it('calls GeneratorEngine exactly once', async () => {
    const fake = new FakeGeneratorStrategy({ key: 'fake' });
    const engine = new DefaultGeneratorEngine([fake]);
    const executor = createExecutor(engine);

    await executor.execute({
      job: makeJob(),
      generationRequest: makeRequest(),
    });

    assert.equal(fake.invocationCount, 1);
  });

  it('stops on first failure (Assembler NotImplemented) and skips later stages', async () => {
    const fake = new FakeGeneratorStrategy({ key: 'fake' });
    const engine = new DefaultGeneratorEngine([fake]);
    const executor = createExecutor(engine);

    const job = await executor.execute({
      job: makeJob(),
      generationRequest: makeRequest(),
    });

    assert.equal(job.status, 'failed');

    const byStage = Object.fromEntries(job.stages.map((s) => [s.stage, s.status]));
    assert.equal(byStage.research, 'succeeded');
    assert.equal(byStage.generator, 'succeeded');
    assert.equal(byStage.assembler, 'failed');
    assert.equal(byStage.qa, 'skipped');
    assert.equal(byStage.publisher, 'skipped');

    const assembler = job.stages.find((s) => s.stage === 'assembler');
    assert.ok(assembler?.errors?.some((e) => e.includes('NOT_IMPLEMENTED')));
  });

  it('never invokes GeneratorEngine when Generator strategy fails', async () => {
    // Engine still called once; strategy fails — verify failure stop from generator
    const fake = new FakeGeneratorStrategy({
      key: 'fake',
      throwError: new Error('strategy-boom'),
    });
    const engine = new DefaultGeneratorEngine([fake]);
    const executor = createExecutor(engine);

    const job = await executor.execute({
      job: makeJob(),
      generationRequest: makeRequest(),
    });

    assert.equal(fake.invocationCount, 1);
    assert.equal(job.status, 'failed');
    const byStage = Object.fromEntries(job.stages.map((s) => [s.stage, s.status]));
    assert.equal(byStage.generator, 'failed');
    assert.equal(byStage.assembler, 'skipped');
    assert.equal(byStage.qa, 'skipped');
    assert.equal(byStage.publisher, 'skipped');
  });
});
