import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CLIPART_STRATEGY_KEY,
  ClipartGeneratorStrategy,
  DefaultGeneratorEngine,
  parseClipartTemplate,
  toClipartTemplateParams,
  type GenerationRequest,
} from '@ai-product-factory/domain';

function makeRequest(overrides: Partial<GenerationRequest> = {}): GenerationRequest {
  return {
    id: 'req-clipart-1',
    strategyKey: CLIPART_STRATEGY_KEY,
    researchBriefId: 'brief-1',
    template: toClipartTemplateParams({
      theme: 'ocean',
      style: 'watercolor',
      assetCount: 3,
    }),
    limits: {},
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('ClipartGeneratorStrategy', () => {
  it('applies theme, style, and assetCount from the template', async () => {
    const strategy = new ClipartGeneratorStrategy();
    const result = await strategy.generate(makeRequest());

    assert.equal(result.ok, true);
    if (!result.ok || !result.assetBundle) {
      assert.fail('expected success with assetBundle');
    }

    assert.equal(result.assetBundle.metadata?.theme, 'ocean');
    assert.equal(result.assetBundle.metadata?.style, 'watercolor');
    assert.equal(result.assetBundle.metadata?.assetCount, 3);
    assert.equal(result.assetBundle.metadata?.productType, 'clipart');
    assert.equal(result.assetBundle.assets.length, 3);

    for (const asset of result.assetBundle.assets) {
      assert.equal(asset.metadata?.theme, 'ocean');
      assert.equal(asset.metadata?.style, 'watercolor');
      assert.equal(asset.mediaType, 'image/png');
      assert.match(String(asset.metadata?.tags ?? ''), /ocean/);
      assert.match(String(asset.metadata?.previewDescriptor ?? ''), /^preview:/);
    }
  });

  it('respects requested asset count', async () => {
    const strategy = new ClipartGeneratorStrategy();
    const result = await strategy.generate(
      makeRequest({
        template: toClipartTemplateParams({
          theme: 'wedding',
          style: 'flat',
          assetCount: 7,
        }),
      }),
    );

    assert.equal(result.ok, true);
    if (!result.ok || !result.assetBundle) {
      assert.fail('expected success with assetBundle');
    }
    assert.equal(result.assetBundle.assets.length, 7);
    assert.equal(result.assetBundle.metadata?.assetCount, 7);
  });

  it('caps asset count by GenerationLimits.maxAssets when lower', async () => {
    const strategy = new ClipartGeneratorStrategy();
    const result = await strategy.generate(
      makeRequest({
        template: toClipartTemplateParams({
          theme: 'forest',
          style: 'line',
          assetCount: 10,
        }),
        limits: { maxAssets: 2 },
      }),
    );

    assert.equal(result.ok, true);
    if (!result.ok || !result.assetBundle) {
      assert.fail('expected success with assetBundle');
    }
    assert.equal(result.assetBundle.assets.length, 2);
  });

  it('produces deterministic output for the same request', async () => {
    const strategy = new ClipartGeneratorStrategy();
    const request = makeRequest();

    const a = await strategy.generate(request);
    const b = await strategy.generate(request);

    assert.equal(a.ok, true);
    assert.equal(b.ok, true);
    if (!a.ok || !b.ok || !a.assetBundle || !b.assetBundle) {
      assert.fail('expected success with assetBundle');
    }

    assert.deepEqual(a.assetBundle, b.assetBundle);
    assert.equal(a.assetBundleId, b.assetBundleId);
    assert.equal(a.assetBundle.assets[0]?.location, b.assetBundle.assets[0]?.location);
    assert.equal(a.assetBundle.assets[0]?.name, 'ocean-watercolor-01.png');
    assert.equal(
      a.assetBundle.assets[0]?.location,
      'memory://clipart/req-clipart-1/ocean-watercolor-01.png',
    );
  });

  it('integrates with DefaultGeneratorEngine without Engine changes', async () => {
    const strategy = new ClipartGeneratorStrategy();
    const engine = new DefaultGeneratorEngine([strategy]);

    assert.deepEqual(engine.registeredKeys(), [CLIPART_STRATEGY_KEY]);

    const result = await engine.generate(makeRequest({ id: 'req-engine-1' }));

    assert.equal(result.ok, true);
    if (!result.ok || !result.assetBundle) {
      assert.fail('expected Engine success with clipart bundle');
    }
    assert.equal(result.assetBundleId, 'clipart-bundle-req-engine-1');
    assert.equal(result.assetBundle.assets.length, 3);
    assert.equal(result.assetBundle.metadata?.strategyKey, CLIPART_STRATEGY_KEY);
  });

  it('parseClipartTemplate reads theme/style/assetCount', () => {
    const parsed = parseClipartTemplate(
      toClipartTemplateParams({ theme: 'cats', style: 'kawaii', assetCount: 5 }),
    );
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.deepEqual(parsed.template, {
        theme: 'cats',
        style: 'kawaii',
        assetCount: 5,
      });
    }
  });
});
