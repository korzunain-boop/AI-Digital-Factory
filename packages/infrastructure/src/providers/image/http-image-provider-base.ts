import type {
  GeneratedImages,
  ImageGenerationPrompt,
  ImageProvider,
} from '@ai-product-factory/domain';

import type { HttpClient, HttpRequest, HttpResponse } from '../../http/http-client.js';
import type { ImageProviderConfig } from './image-provider-config.js';
import {
  AuthenticationError,
  InvalidResponseError,
  ProviderError,
  ProviderTimeoutError,
  ProviderUnavailableError,
  RateLimitError,
} from './provider-errors.js';

/**
 * Reusable HTTP image provider base (Milestone M9).
 *
 * Responsibility (generic only):
 * - HTTP client usage
 * - authentication headers
 * - request execution
 * - timeout (via HttpRequest.timeoutMs)
 * - retry policy
 * - response status validation
 * - HTTP → provider error translation
 *
 * Subclasses (e.g. OpenAIImageProvider) own vendor-specific request/response mapping.
 * No OpenAI logic lives here.
 */
export abstract class HttpImageProviderBase implements ImageProvider {
  protected constructor(
    protected readonly config: ImageProviderConfig,
    protected readonly http: HttpClient,
  ) {}

  /**
   * Domain ImageProvider entry — delegates to vendor-specific {@link doGenerateImages}.
   */
  async generateImages(prompt: ImageGenerationPrompt): Promise<GeneratedImages> {
    return this.doGenerateImages(prompt);
  }

  /**
   * Vendor-specific generation using {@link executeJsonRequest} helpers.
   */
  protected abstract doGenerateImages(prompt: ImageGenerationPrompt): Promise<GeneratedImages>;

  /**
   * Default Bearer auth header. Override for non-Bearer schemes.
   */
  protected buildAuthHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Execute JSON HTTP with retries, timeout, and error translation.
   * Returns parsed JSON object on 2xx.
   */
  protected async executeJsonRequest(
    partial: Omit<HttpRequest, 'timeoutMs' | 'headers'> & {
      headers?: Readonly<Record<string, string>>;
      timeoutMs?: number;
    },
  ): Promise<unknown> {
    const request: HttpRequest = {
      url: partial.url,
      method: partial.method,
      body: partial.body,
      timeoutMs: partial.timeoutMs ?? this.config.timeoutMs,
      headers: {
        ...this.buildAuthHeaders(),
        ...partial.headers,
      },
    };

    const attempts = this.config.retries + 1;
    let lastError: unknown;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const response = await this.http.request(request);
        return this.validateAndParseJson(response);
      } catch (cause) {
        lastError = cause;
        const translated = this.translateError(cause);

        if (!this.isRetryable(translated) || attempt === attempts) {
          throw translated;
        }
      }
    }

    throw this.translateError(lastError);
  }

  /**
   * Validate HTTP status and parse JSON body.
   */
  protected validateAndParseJson(response: HttpResponse): unknown {
    if (response.status === 401 || response.status === 403) {
      throw new AuthenticationError(`Authentication failed (HTTP ${response.status})`);
    }
    if (response.status === 429) {
      throw new RateLimitError(`Rate limited (HTTP ${response.status})`);
    }
    if (response.status >= 500) {
      throw new ProviderUnavailableError(`Provider unavailable (HTTP ${response.status})`);
    }
    if (response.status < 200 || response.status >= 300) {
      throw new ProviderUnavailableError(`Unexpected HTTP status ${response.status}`);
    }

    if (!response.bodyText || response.bodyText.trim() === '') {
      throw new InvalidResponseError('Empty response body');
    }

    try {
      return JSON.parse(response.bodyText) as unknown;
    } catch (cause) {
      throw new InvalidResponseError('Response body is not valid JSON', cause);
    }
  }

  /**
   * Map unknown/raw errors into the provider error hierarchy.
   */
  protected translateError(cause: unknown): ProviderError {
    if (cause instanceof ProviderError) {
      return cause;
    }

    if (cause instanceof Error) {
      if (cause.name === 'AbortError' || /aborted|timeout/i.test(cause.message)) {
        return new ProviderTimeoutError('Provider request timed out', cause);
      }
      if (/network|fetch failed|ECONNREFUSED|ENOTFOUND/i.test(cause.message)) {
        return new ProviderUnavailableError('Provider network failure', cause);
      }
      return new ProviderUnavailableError(cause.message, cause);
    }

    return new ProviderUnavailableError('Unknown provider failure', cause);
  }

  /**
   * Retry on transient failures only (not auth / invalid response).
   */
  protected isRetryable(error: ProviderError): boolean {
    return (
      error instanceof RateLimitError ||
      error instanceof ProviderUnavailableError ||
      error instanceof ProviderTimeoutError
    );
  }
}
