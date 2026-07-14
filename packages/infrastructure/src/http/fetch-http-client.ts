import type { HttpClient, HttpRequest, HttpResponse } from './http-client.js';

/**
 * Fetch-based HttpClient for production wiring.
 * AbortSignal enforces timeout. Not used in M9 unit tests (mocks only).
 */
export class FetchHttpClient implements HttpClient {
  async request(request: HttpRequest): Promise<HttpResponse> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), request.timeoutMs);

    try {
      const response = await fetch(request.url, {
        method: request.method,
        headers: { ...request.headers },
        body: request.body,
        signal: controller.signal,
      });

      const bodyText = await response.text();
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      return {
        status: response.status,
        headers,
        bodyText,
      };
    } catch (cause) {
      if (cause instanceof Error && cause.name === 'AbortError') {
        throw cause;
      }
      throw cause;
    } finally {
      clearTimeout(timer);
    }
  }
}
