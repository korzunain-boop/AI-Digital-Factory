import type { GenerationFailure, GenerationRequestId } from '../objects/index.js';
import { DomainError, type DomainErrorCode } from './domain-error.js';

/**
 * Format a DomainError into the string list carried by GenerationFailure.errors.
 * Convention: `CODE: message` so callers can parse without changing GenerationResult.
 */
export function formatDomainError(code: DomainErrorCode, message: string): string {
  return `${code}: ${message}`;
}

/**
 * Build a GenerationFailure from a DomainError (or code + message).
 */
export function generationFailureFromDomainError(
  generationRequestId: GenerationRequestId,
  error: DomainError | { code: DomainErrorCode; message: string },
  approximateCost?: number,
): GenerationFailure {
  const code = error instanceof DomainError ? error.code : error.code;
  const message = error instanceof DomainError ? error.message : error.message;
  return {
    ok: false,
    generationRequestId,
    errors: [formatDomainError(code, message)],
    ...(approximateCost !== undefined ? { approximateCost } : {}),
  };
}

/**
 * Re-export DomainError helpers for Domain consumers.
 */
export { DomainError, DomainErrorCodes } from './domain-error.js';
export type { DomainErrorCode } from './domain-error.js';
