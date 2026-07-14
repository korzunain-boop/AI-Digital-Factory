/**
 * Minimal HTTP client port for provider infrastructure.
 * Implementations may use fetch; tests inject mocks — no globals required by callers.
 */
export interface HttpRequest {
  readonly url: string;
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  readonly headers: Readonly<Record<string, string>>;
  readonly body?: string;
  /** Per-request timeout in milliseconds. */
  readonly timeoutMs: number;
}

/**
 * Normalized HTTP response (text body — JSON parsing is the caller's job).
 */
export interface HttpResponse {
  readonly status: number;
  readonly headers: Readonly<Record<string, string>>;
  readonly bodyText: string;
}

/**
 * HTTP client abstraction used by {@link HttpImageProviderBase}.
 */
export interface HttpClient {
  request(request: HttpRequest): Promise<HttpResponse>;
}
