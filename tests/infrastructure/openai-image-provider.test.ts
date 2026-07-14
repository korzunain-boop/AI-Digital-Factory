import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ImageGenerationPrompt } from '@ai-product-factory/domain';

import {
  AuthenticationError,
  createImageProviderConfig,
  InvalidResponseError,
  OpenAIImageProvider,
  ProviderTimeoutError,
  ProviderUnavailableError,
  RateLimitError,
  type HttpClient,
  type HttpRequest,
  type HttpResponse,
} from '@ai-product-factory/infrastructure';

function samplePrompt(overrides?: Partial<ImageGenerationPrompt>): ImageGenerationPrompt {
  return {
    requestId: 'req-1',
    count: 1,
    theme: 'Cats',
    style: 'Flat',
    purpose: 'clipart',
    width: 1024,
    height: 1024,
    prompts: ['cute cat clipart, flat vector style'],
    negativePrompt: 'text, watermark',
    ...overrides,
  };
}

function createConfig(retries = 0) {
  return createImageProviderConfig({
    apiKey: 'test-key',
    baseUrl: 'https://api.example.test/v1',
    model: 'gpt-image-1',
    timeoutMs: 5_000,
    retries,
  });
}

/**
 * Mock HttpClient — records calls; never touches the network.
 */
function createMockHttpClient(
  handler: (request: HttpRequest, callIndex: number) => Promise<HttpResponse> | HttpResponse,
): HttpClient & { readonly requests: HttpRequest[] } {
  const requests: HttpRequest[] = [];
  return {
    requests,
    async request(request: HttpRequest): Promise<HttpResponse> {
      requests.push(request);
      return handler(request, requests.length - 1);
    },
  };
}

function jsonResponse(status: number, body: unknown): HttpResponse {
  return {
    status,
    headers: { 'content-type': 'application/json' },
    bodyText: typeof body === 'string' ? body : JSON.stringify(body),
  };
}

describe('OpenAIImageProvider (M9 HTTP infrastructure)', () => {
  it('successful request returns GeneratedImages from URL payload', async () => {
    const http = createMockHttpClient(() =>
      jsonResponse(200, {
        data: [{ url: 'https://cdn.example.test/cat.png', revised_prompt: 'revised' }],
      }),
    );
    const provider = new OpenAIImageProvider(createConfig(), http);

    const result = await provider.generateImages(samplePrompt());

    assert.equal(http.requests.length, 1);
    assert.equal(http.requests[0]?.method, 'POST');
    assert.equal(http.requests[0]?.url, 'https://api.example.test/v1/images/generations');
    assert.equal(http.requests[0]?.headers.Authorization, 'Bearer test-key');
    assert.ok(http.requests[0]?.body?.includes('"model":"gpt-image-1"'));

    assert.equal(result.images.length, 1);
    assert.equal(result.images[0]?.location, 'https://cdn.example.test/cat.png');
    assert.equal(result.images[0]?.mediaType, 'image/png');
    assert.equal(result.images[0]?.metadata?.model, 'gpt-image-1');
    assert.equal(result.images[0]?.metadata?.provider, 'openai');
  });

  it('successful request accepts b64_json binary payload as data URL', async () => {
    const http = createMockHttpClient(() =>
      jsonResponse(200, {
        data: [{ b64_json: 'AAAA' }],
      }),
    );
    const provider = new OpenAIImageProvider(createConfig(), http);

    const result = await provider.generateImages(samplePrompt());

    assert.equal(result.images[0]?.location, 'data:image/png;base64,AAAA');
  });

  it('authentication failure maps 401 to AuthenticationError', async () => {
    const http = createMockHttpClient(() => jsonResponse(401, { error: { message: 'bad key' } }));
    const provider = new OpenAIImageProvider(createConfig(), http);

    await assert.rejects(
      () => provider.generateImages(samplePrompt()),
      (err: unknown) => {
        assert.ok(err instanceof AuthenticationError);
        assert.equal(err.code, 'AUTHENTICATION');
        assert.match(err.message, /401/);
        return true;
      },
    );
  });

  it('authentication failure maps 403 to AuthenticationError (no raw fetch error)', async () => {
    const http = createMockHttpClient(() => jsonResponse(403, { error: 'forbidden' }));
    const provider = new OpenAIImageProvider(createConfig(), http);

    await assert.rejects(() => provider.generateImages(samplePrompt()), AuthenticationError);
  });

  it('timeout maps AbortError to ProviderTimeoutError', async () => {
    const http = createMockHttpClient(() => {
      const err = new Error('The operation was aborted');
      err.name = 'AbortError';
      return Promise.reject(err);
    });
    const provider = new OpenAIImageProvider(createConfig(0), http);

    await assert.rejects(
      () => provider.generateImages(samplePrompt()),
      (err: unknown) => {
        assert.ok(err instanceof ProviderTimeoutError);
        assert.equal(err.code, 'TIMEOUT');
        return true;
      },
    );
  });

  it('invalid response: non-JSON body → InvalidResponseError', async () => {
    const http = createMockHttpClient(() => ({
      status: 200,
      headers: {},
      bodyText: 'not-json',
    }));
    const provider = new OpenAIImageProvider(createConfig(), http);

    await assert.rejects(() => provider.generateImages(samplePrompt()), InvalidResponseError);
  });

  it('invalid response: missing data[] → InvalidResponseError', async () => {
    const http = createMockHttpClient(() => jsonResponse(200, { data: [] }));
    const provider = new OpenAIImageProvider(createConfig(), http);

    await assert.rejects(
      () => provider.generateImages(samplePrompt()),
      (err: unknown) => {
        assert.ok(err instanceof InvalidResponseError);
        assert.match(err.message, /data/);
        return true;
      },
    );
  });

  it('invalid response: missing url and b64_json → InvalidResponseError', async () => {
    const http = createMockHttpClient(() => jsonResponse(200, { data: [{}] }));
    const provider = new OpenAIImageProvider(createConfig(), http);

    await assert.rejects(() => provider.generateImages(samplePrompt()), InvalidResponseError);
  });

  it('provider error translation: 429 → RateLimitError', async () => {
    const http = createMockHttpClient(() => jsonResponse(429, { error: 'slow down' }));
    const provider = new OpenAIImageProvider(createConfig(0), http);

    await assert.rejects(() => provider.generateImages(samplePrompt()), RateLimitError);
  });

  it('provider error translation: 503 → ProviderUnavailableError', async () => {
    const http = createMockHttpClient(() => jsonResponse(503, { error: 'down' }));
    const provider = new OpenAIImageProvider(createConfig(0), http);

    await assert.rejects(() => provider.generateImages(samplePrompt()), ProviderUnavailableError);
  });

  it('provider error translation: network failure → ProviderUnavailableError', async () => {
    const http = createMockHttpClient(() => Promise.reject(new Error('fetch failed')));
    const provider = new OpenAIImageProvider(createConfig(0), http);

    await assert.rejects(
      () => provider.generateImages(samplePrompt()),
      (err: unknown) => {
        assert.ok(err instanceof ProviderUnavailableError);
        assert.equal(err.code, 'PROVIDER_UNAVAILABLE');
        return true;
      },
    );
  });

  it('retries transient failures then succeeds', async () => {
    const http = createMockHttpClient((_req, callIndex) => {
      if (callIndex === 0) {
        return jsonResponse(429, { error: 'rate' });
      }
      return jsonResponse(200, { data: [{ url: 'https://cdn.example.test/ok.png' }] });
    });
    const provider = new OpenAIImageProvider(createConfig(2), http);

    const result = await provider.generateImages(samplePrompt());

    assert.equal(http.requests.length, 2);
    assert.equal(result.images[0]?.location, 'https://cdn.example.test/ok.png');
  });

  it('does not retry authentication failures', async () => {
    const http = createMockHttpClient(() => jsonResponse(401, { error: 'nope' }));
    const provider = new OpenAIImageProvider(createConfig(3), http);

    await assert.rejects(() => provider.generateImages(samplePrompt()), AuthenticationError);
    assert.equal(http.requests.length, 1);
  });
});

describe('createImageProviderConfig', () => {
  it('rejects missing apiKey and strips trailing slash from baseUrl', () => {
    assert.throws(() =>
      createImageProviderConfig({
        apiKey: '',
        baseUrl: 'https://api.example.test/v1/',
        model: 'm',
        timeoutMs: 1000,
        retries: 0,
      }),
    );

    const cfg = createImageProviderConfig({
      apiKey: 'k',
      baseUrl: 'https://api.example.test/v1/',
      model: 'm',
      timeoutMs: 1000,
      retries: 0,
    });
    assert.equal(cfg.baseUrl, 'https://api.example.test/v1');
  });
});
