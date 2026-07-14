import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CLIPART_STRATEGY_KEY,
  FakeImageProvider,
  toClipartTemplateParams,
  type GenerationRequest,
} from '@ai-product-factory/domain';
import {
  OpenAIImageProvider,
  type HttpClient,
  type HttpResponse,
} from '@ai-product-factory/infrastructure';

import {
  createComposition,
  createImageProviderFromConfig,
} from '@ai-product-factory/api/composition';
import {
  ConfigurationError,
  loadRuntimeConfig,
  type RuntimeConfig,
} from '@ai-product-factory/api/config';

function sampleRequest(): GenerationRequest {
  return {
    id: 'req-m10-1',
    strategyKey: CLIPART_STRATEGY_KEY,
    researchBriefId: 'brief-m10',
    template: toClipartTemplateParams({
      theme: 'cat',
      style: 'flat',
      assetCount: 1,
    }),
    limits: { maxAssets: 1 },
    createdAt: '2026-07-14T00:00:00.000Z',
  };
}

function createMockHttp(url: string): HttpClient {
  return {
    async request(): Promise<HttpResponse> {
      return {
        status: 200,
        headers: { 'content-type': 'application/json' },
        bodyText: JSON.stringify({
          data: [{ url }],
        }),
      };
    },
  };
}

describe('M10 composition — config-driven ImageProvider', () => {
  it('switches Fake ↔ OpenAI via RuntimeConfig and runs full Engine flow (mocked OpenAI HTTP)', async () => {
    const fakeConfig: RuntimeConfig = { imageProvider: 'fake' };
    assert.ok(createImageProviderFromConfig(fakeConfig) instanceof FakeImageProvider);

    const { engine: fakeEngine } = createComposition(fakeConfig);
    const fakeResult = await fakeEngine.generate(sampleRequest());
    assert.equal(fakeResult.ok, true);
    if (fakeResult.ok) {
      assert.ok(fakeResult.assetBundle);
      assert.match(fakeResult.assetBundle?.assets[0]?.location ?? '', /^memory:\/\//);
    }

    const openaiConfig: RuntimeConfig = {
      imageProvider: 'openai',
      openai: {
        apiKey: 'test-key',
        model: 'dall-e-3',
        baseUrl: 'https://api.example.test/v1',
        timeoutMs: 5_000,
        retries: 0,
      },
    };

    const mockedUrl = 'https://cdn.example.test/generated-cat.png';
    assert.ok(
      createImageProviderFromConfig(openaiConfig, { http: createMockHttp(mockedUrl) }) instanceof
        OpenAIImageProvider,
    );

    const { engine } = createComposition(openaiConfig, {
      http: createMockHttp(mockedUrl),
    });

    const result = await engine.generate(sampleRequest());
    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }

    assert.equal(result.assetBundle?.assets.length, 1);
    assert.equal(result.assetBundle?.assets[0]?.location, mockedUrl);
    assert.equal(result.assetBundle?.assets[0]?.metadata?.provider, 'openai');
    assert.equal(result.assetBundle?.assets[0]?.metadata?.model, 'dall-e-3');
  });

  it('loadRuntimeConfig requires OPENAI_API_KEY when IMAGE_PROVIDER=openai', () => {
    assert.throws(
      () =>
        loadRuntimeConfig({
          IMAGE_PROVIDER: 'openai',
        }),
      (err: unknown) => {
        assert.ok(err instanceof ConfigurationError);
        assert.match(err.message, /OPENAI_API_KEY is missing/);
        return true;
      },
    );

    const config = loadRuntimeConfig({
      IMAGE_PROVIDER: 'openai',
      OPENAI_API_KEY: 'sk-test',
      OPENAI_IMAGE_MODEL: 'gpt-image-1',
    });
    assert.equal(config.imageProvider, 'openai');
    assert.equal(config.openai?.model, 'gpt-image-1');
    assert.equal(config.openai?.apiKey, 'sk-test');
  });
});
