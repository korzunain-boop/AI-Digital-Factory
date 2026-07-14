import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DefaultGeneratorEngine,
  DomainErrorCodes,
  FakeGeneratorStrategy,
  type GenerationRequest,
} from '@ai-product-factory/domain';

function makeRequest(overrides: Partial<GenerationRequest> = {}): GenerationRequest {
  return {
    id: 'req-1',
    strategyKey: 'fake',
    researchBriefId: 'brief-1',
    template: { values: {} },
    limits: {},
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('DefaultGeneratorEngine', () => {
  it('registers strategies from constructor injection', () => {
    const a = new FakeGeneratorStrategy({ key: 'alpha' });
    const b = new FakeGeneratorStrategy({ key: 'beta' });
    const engine = new DefaultGeneratorEngine([a, b]);

    assert.deepEqual([...engine.registeredKeys()].sort(), ['alpha', 'beta']);
  });

  it('executes the selected strategy successfully', async () => {
    const fake = new FakeGeneratorStrategy({ key: 'fake' });
    const engine = new DefaultGeneratorEngine([fake]);

    const result = await engine.generate(makeRequest({ id: 'req-success' }));

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.generationRequestId, 'req-success');
      assert.equal(result.assetBundleId, 'fake-bundle-req-success');
      assert.equal(result.approximateCost, 0);
    }
    assert.equal(fake.invocationCount, 1);
  });

  it('returns a domain UNKNOWN_STRATEGY failure when the key is missing', async () => {
    const engine = new DefaultGeneratorEngine([new FakeGeneratorStrategy({ key: 'fake' })]);

    const result = await engine.generate(makeRequest({ strategyKey: 'missing-key' }));

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.generationRequestId, 'req-1');
      assert.equal(result.errors.length, 1);
      assert.match(result.errors[0] ?? '', new RegExp(`^${DomainErrorCodes.UNKNOWN_STRATEGY}:`));
      assert.match(result.errors[0] ?? '', /missing-key/);
    }
  });

  it('maps strategy exceptions to STRATEGY_EXECUTION_FAILED domain failures', async () => {
    const fake = new FakeGeneratorStrategy({
      key: 'fake',
      throwError: new Error('boom-from-strategy'),
    });
    const engine = new DefaultGeneratorEngine([fake]);

    const result = await engine.generate(makeRequest());

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(
        result.errors[0] ?? '',
        new RegExp(`^${DomainErrorCodes.STRATEGY_EXECUTION_FAILED}:`),
      );
      assert.match(result.errors[0] ?? '', /boom-from-strategy/);
    }
    assert.equal(fake.invocationCount, 1);
  });

  it('remains stateless between executions', async () => {
    const fake = new FakeGeneratorStrategy({ key: 'fake' });
    const engine = new DefaultGeneratorEngine([fake]);

    const first = await engine.generate(makeRequest({ id: 'req-a' }));
    const second = await engine.generate(makeRequest({ id: 'req-b' }));

    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    if (first.ok && second.ok) {
      assert.equal(first.assetBundleId, 'fake-bundle-req-a');
      assert.equal(second.assetBundleId, 'fake-bundle-req-b');
      assert.notEqual(first.assetBundleId, second.assetBundleId);
    }
    assert.equal(fake.invocationCount, 2);
    // Engine does not accumulate registered keys across runs
    assert.deepEqual(engine.registeredKeys(), ['fake']);
  });
});
