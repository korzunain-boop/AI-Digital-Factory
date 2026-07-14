import type { ResearchBriefId } from './ids.js';

/**
 * Normalized niche/intent input produced by research ingest.
 * Feeds GenerationRequest construction; retained for history/audit.
 */
export interface ResearchBrief {
  /** Stable identifier for this brief. */
  readonly id: ResearchBriefId;

  /** Human-readable title or niche label. */
  readonly title: string;

  /** Search / SEO style keywords. */
  readonly keywords: readonly string[];

  /** Free-form constraints (style, pack size hints, bans, etc.). */
  readonly constraints: readonly string[];

  /**
   * Suggested product-type hint for operators (not Engine category logic).
   * Engine still selects a strategy via GenerationRequest.strategyKey.
   */
  readonly suggestedProductTypeHint?: string;

  /** Where the brief came from (manual, csv, everbee, etc.). */
  readonly source: ResearchSourceMetadata;

  /** ISO-8601 creation timestamp. */
  readonly createdAt: string;
}

/**
 * Provenance metadata for a ResearchBrief.
 * Keeps ResearchProvider implementations swappable without Domain knowing vendors.
 */
export interface ResearchSourceMetadata {
  /** Logical provider/source kind, e.g. "manual" | "csv" | "everbee". */
  readonly kind: string;

  /** Optional external reference (file name, import batch id, etc.). */
  readonly externalRef?: string;

  /** Optional raw notes from the operator. */
  readonly notes?: string;
}
