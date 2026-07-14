/**
 * Injected configuration for HTTP image providers.
 * No globals and no hardcoded secrets — values come from composition root / env mapping later.
 */
export interface ImageProviderConfig {
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly model: string;
  /** Request timeout in milliseconds. */
  readonly timeoutMs: number;
  /** Number of retries after the first attempt (total attempts = retries + 1). */
  readonly retries: number;
}

/**
 * Create config from explicit values (composition root / tests).
 */
export function createImageProviderConfig(input: ImageProviderConfig): ImageProviderConfig {
  if (!input.apiKey) {
    throw new Error('ImageProviderConfig.apiKey is required');
  }
  if (!input.baseUrl) {
    throw new Error('ImageProviderConfig.baseUrl is required');
  }
  if (!input.model) {
    throw new Error('ImageProviderConfig.model is required');
  }
  if (input.timeoutMs <= 0) {
    throw new Error('ImageProviderConfig.timeoutMs must be > 0');
  }
  if (input.retries < 0) {
    throw new Error('ImageProviderConfig.retries must be >= 0');
  }
  return {
    apiKey: input.apiKey,
    baseUrl: input.baseUrl.replace(/\/$/, ''),
    model: input.model,
    timeoutMs: input.timeoutMs,
    retries: input.retries,
  };
}
