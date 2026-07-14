/**
 * Thrown by Application Layer use cases that are orchestration contracts only (M3).
 * Indicates the method boundary exists but pipeline behavior is not implemented yet.
 */
export class NotImplementedError extends Error {
  readonly code = 'NOT_IMPLEMENTED' as const;

  constructor(operation: string) {
    super(`Not implemented: ${operation}`);
    this.name = 'NotImplementedError';
  }
}
