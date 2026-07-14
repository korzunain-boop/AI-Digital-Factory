import type { ResearchBrief } from '../objects/index.js';

/**
 * Opaque input for research ingest.
 * Infrastructure maps CSV/manual/EverBee payloads into this shape —
 * Domain does not depend on vendor SDKs or filesystems.
 */
export interface ResearchIngestInput {
  /** Logical source kind, e.g. "manual" | "csv" | "everbee". */
  readonly kind: string;
  /** Opaque payload reference or inline fields — no FS/HTTP types. */
  readonly payload: Readonly<Record<string, string | number | boolean | null | readonly string[]>>;
}

/**
 * Research provider port: ingest external/manual research → ResearchBrief.
 * Replaceable (CSV, EverBee-like import, manual form; own AI agent later).
 * Implementations live in Infrastructure — this is Domain-only contract.
 */
export interface ResearchProvider {
  ingest(input: ResearchIngestInput): Promise<ResearchBrief>;
}
