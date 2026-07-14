/**
 * Infrastructure adapters (HTTP providers, persistence, etc.).
 * Provider-agnostic HTTP base lives here; vendor SDKs stay isolated in subfolders.
 */

export type { HttpClient, HttpRequest, HttpResponse } from './http/http-client.js';
export { FetchHttpClient } from './http/fetch-http-client.js';

export type { ImageProviderConfig } from './providers/image/image-provider-config.js';
export { createImageProviderConfig } from './providers/image/image-provider-config.js';

export {
  ProviderError,
  AuthenticationError,
  RateLimitError,
  InvalidResponseError,
  ProviderUnavailableError,
  ProviderTimeoutError,
} from './providers/image/provider-errors.js';

export { HttpImageProviderBase } from './providers/image/http-image-provider-base.js';
export { OpenAIImageProvider } from './providers/image/openai/openai-image-provider.js';
