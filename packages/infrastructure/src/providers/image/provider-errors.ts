/**
 * Provider error hierarchy for image (and future) HTTP providers.
 * Callers never see raw fetch/SDK errors — only these types.
 */
export type ProviderErrorCode =
  | 'AUTHENTICATION'
  | 'RATE_LIMIT'
  | 'INVALID_RESPONSE'
  | 'PROVIDER_UNAVAILABLE'
  | 'TIMEOUT'
  | 'UNKNOWN';

export class ProviderError extends Error {
  override readonly name: string = 'ProviderError';

  constructor(
    readonly code: ProviderErrorCode,
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
  }
}

export class AuthenticationError extends ProviderError {
  override readonly name = 'AuthenticationError';

  constructor(message: string, cause?: unknown) {
    super('AUTHENTICATION', message, cause);
  }
}

export class RateLimitError extends ProviderError {
  override readonly name = 'RateLimitError';

  constructor(message: string, cause?: unknown) {
    super('RATE_LIMIT', message, cause);
  }
}

export class InvalidResponseError extends ProviderError {
  override readonly name = 'InvalidResponseError';

  constructor(message: string, cause?: unknown) {
    super('INVALID_RESPONSE', message, cause);
  }
}

export class ProviderUnavailableError extends ProviderError {
  override readonly name = 'ProviderUnavailableError';

  constructor(message: string, cause?: unknown) {
    super('PROVIDER_UNAVAILABLE', message, cause);
  }
}

export class ProviderTimeoutError extends ProviderError {
  override readonly name = 'ProviderTimeoutError';

  constructor(message: string, cause?: unknown) {
    super('TIMEOUT', message, cause);
  }
}
