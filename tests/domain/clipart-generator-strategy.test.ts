import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildItemPrompt,
  CLIPART_STRATEGY_KEY,
  ClipartGeneratorStrategy,
  DefaultGeneratorEngine,
  DefaultPromptBuilder,
  FakeImageProvider,
  parseClipartTemplate,
  toClipartTemplateParams,
  type GenerationRequest,
  type GeneratedImages,
  type ImageGenerationPrompt,
  type ImageProvider,
  type PromptBuilder,
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

describe('DefaultPromptBuilder', () => {
  it('builds deterministic structured prompts from the template', () => {
    const builder = new DefaultPromptBuilder();
    const request = makeRequest();
    const prompt = builder.build({
      request,
      template: { theme: 'ocean', style: 'watercolor', assetCount: 3 },
    });

    assert.equal(prompt.requestId, 'req-clipart-1');
    assert.equal(prompt.count, 3);
    assert.equal(prompt.theme, 'ocean');
    assert.equal(prompt.style, 'watercolor');
    assert.equal(prompt.purpose, 'clipart');
    assert.equal(prompt.prompts.length, 3);
    assert.equal(prompt.prompts[0], buildItemPrompt('ocean', 'watercolor', 1, 3));
    assert.match(prompt.prompts[0] ?? '', /Theme: ocean/);
    assert.match(prompt.prompts[0] ?? '', /Style: watercolor/);
    assert.match(prompt.negativePrompt, /watermark/);
  });

  it('produces identical prompts for identical inputs', () => {
    const builder = new DefaultPromptBuilder();
    const input = {
      request: makeRequest(),
      template: { theme: 'wedding', style: 'flat', assetCount: 2 },
    };

    assert.deepEqual(builder.build(input), builder.build(input));
  });
});

describe('ClipartGeneratorStrategy + PromptBuilder + ImageProvider', () => {
  it('uses PromptBuilder then ImageProvider (ImageProvider receives prompt, not GenerationRequest)', async () => {
    let buildCalls = 0;
    let seenPrompt: ImageGenerationPrompt | undefined;

    const promptBuilder: PromptBuilder = {
      build(input) {
        buildCalls += 1;
        return new DefaultPromptBuilder().build(input);
      },
    };

    const images: ImageProvider = {
      async generateImages(prompt): Promise<GeneratedImages> {
        seenPrompt = prompt;
        return new FakeImageProvider().generateImages(prompt);
      },
    };

    const strategy = new ClipartGeneratorStrategy(images, promptBuilder);
    const result = await strategy.generate(makeRequest());

    assert.equal(result.ok, true);
    assert.equal(buildCalls, 1);
    assert.ok(seenPrompt);
    assert.equal(seenPrompt.requestId, 'req-clipart-1');
    assert.equal(seenPrompt.theme, 'ocean');
    assert.equal(seenPrompt.style, 'watercolor');
    assert.equal(seenPrompt.count, 3);
    assert.equal(seenPrompt.prompts.length, 3);
    // ImageProvider must not need GenerationRequest — prompt is self-contained
    assert.ok(!('researchBriefId' in seenPrompt));
  });

  it('calls ImageProvider.generateImages with the built prompt', async () => {
    const provider = new FakeImageProvider();
    const strategy = new ClipartGeneratorStrategy(provider);

    await strategy.generate(makeRequest());

    assert.equal(provider.invocationCount, 1);
    assert.ok(provider.lastPrompt);
    assert.equal(provider.lastPrompt.purpose, 'clipart');
    assert.equal(provider.lastPrompt.prompts[0], buildItemPrompt('ocean', 'watercolor', 1, 3));
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
    assert.equal(result.assetBundle.assets.length, 3);
    assert.match(String(result.assetBundle.assets[0]?.metadata?.promptText ?? ''), /Theme: ocean/);
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
  });

  it('maps ImageProvider exceptions to GenerationFailure', async () => {
    const provider = new FakeImageProvider({ throwError: new Error('provider-boom') });
    const strategy = new ClipartGeneratorStrategy(provider);

    const result = await strategy.generate(makeRequest());

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.errors[0] ?? '', /IMAGE_PROVIDER_FAILED/);
    }
  });

  it('integrates with DefaultGeneratorEngine without Engine changes', async () => {
    const strategy = new ClipartGeneratorStrategy(new FakeImageProvider());
    const engine = new DefaultGeneratorEngine([strategy]);

    const result = await engine.generate(makeRequest({ id: 'req-engine-1' }));

    assert.equal(result.ok, true);
    if (!result.ok || !result.assetBundle) {
      assert.fail('expected Engine success with clipart bundle');
    }
    assert.equal(result.assetBundleId, 'clipart-bundle-req-engine-1');
    assert.equal(result.assetBundle.assets.length, 3);
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
