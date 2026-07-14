/**
 * Domain-level error with a stable machine-readable code.
 * Prefer returning structured GenerationFailure (via helpers) from the Engine
 * instead of throwing generic Error instances across layer boundaries.
 */
export class DomainError extends Error {
  readonly name = 'DomainError';

  constructor(
    readonly code: DomainErrorCode,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Stable Domain error codes used by Engine and (later) other Domain services.
 */
export type DomainErrorCode = 'UNKNOWN_STRATEGY' | 'STRATEGY_EXECUTION_FAILED';

export const DomainErrorCodes = {
  UNKNOWN_STRATEGY: 'UNKNOWN_STRATEGY',
  STRATEGY_EXECUTION_FAILED: 'STRATEGY_EXECUTION_FAILED',
} as const satisfies Record<string, DomainErrorCode>;
