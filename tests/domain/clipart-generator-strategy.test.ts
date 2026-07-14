import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CLIPART_STRATEGY_KEY,
  ClipartGeneratorStrategy,
  DefaultGeneratorEngine,
  FakeImageProvider,
  parseClipartTemplate,
  toClipartTemplateParams,
  type GenerationRequest,
  type ImageGenerationRequest,
  type ImageProvider,
  type GeneratedImages,
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

describe('ClipartGeneratorStrategy + ImageProvider', () => {
  it('calls ImageProvider.generateImages', async () => {
    const provider = new FakeImageProvider();
    const strategy = new ClipartGeneratorStrategy(provider);

    await strategy.generate(makeRequest());

    assert.equal(provider.invocationCount, 1);
  });

  it('applies theme, style, and assetCount via provider output', async () => {
    const strategy = new ClipartGeneratorStrategy(new FakeImageProvider());
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
    const provider = new FakeImageProvider();
    const strategy = new ClipartGeneratorStrategy(provider);
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
    assert.equal(provider.invocationCount, 1);
  });

  it('produces deterministic output for the same request', async () => {
    const strategy = new ClipartGeneratorStrategy(new FakeImageProvider());
    const request = makeRequest();

    const a = await strategy.generate(request);
    const b = await strategy.generate(request);

    assert.equal(a.ok, true);
    assert.equal(b.ok, true);
    if (!a.ok || !b.ok || !a.assetBundle || !b.assetBundle) {
      assert.fail('expected success with assetBundle');
    }

    assert.deepEqual(a.assetBundle, b.assetBundle);
    assert.equal(a.assetBundle.assets[0]?.name, 'ocean-watercolor-01.png');
    assert.equal(
      a.assetBundle.assets[0]?.location,
      'memory://clipart/req-clipart-1/ocean-watercolor-01.png',
    );
  });

  it('maps ImageProvider exceptions to GenerationFailure', async () => {
    const provider = new FakeImageProvider({ throwError: new Error('provider-boom') });
    const strategy = new ClipartGeneratorStrategy(provider);

    const result = await strategy.generate(makeRequest());

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.errors[0] ?? '', /IMAGE_PROVIDER_FAILED/);
      assert.match(result.errors[0] ?? '', /provider-boom/);
    }
    assert.equal(provider.invocationCount, 1);
  });

  it('integrates with DefaultGeneratorEngine without Engine changes', async () => {
    const strategy = new ClipartGeneratorStrategy(new FakeImageProvider());
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

  it('passes count/theme/style from template into ImageProvider request', async () => {
    let seen: ImageGenerationRequest | undefined;
    const spy: ImageProvider = {
      async generateImages(req): Promise<GeneratedImages> {
        seen = req;
        return { images: [] };
      },
    };

    const strategy = new ClipartGeneratorStrategy(spy);
    await strategy.generate(
      makeRequest({
        template: toClipartTemplateParams({
          theme: 'cats',
          style: 'kawaii',
          assetCount: 2,
        }),
      }),
    );

    assert.ok(seen);
    assert.equal(seen.requestId, 'req-clipart-1');
    assert.equal(seen.theme, 'cats');
    assert.equal(seen.style, 'kawaii');
    assert.equal(seen.count, 2);
    assert.equal(seen.purpose, 'clipart');
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
