/**
 * LLMProvider port — structured text completion for product workflows.
 *
 * No OpenAI / vendor SDK types here. Real adapters live in infrastructure later.
 * Distinct from {@link TextProvider} (listing copy drafts); this port drives
 * Style Guide / subject / prompt generation for illustration bundles.
 */
export type LLMPurpose =
  'style-guide' | 'illustration-subjects' | 'illustration-prompts' | 'general';

export interface LLMCompleteInput {
  /** Optional system instruction. */
  readonly system?: string;
  /** User / task prompt. */
  readonly prompt: string;
  /** Workflow purpose (helps fakes and future adapters). */
  readonly purpose?: LLMPurpose;
  readonly maxTokens?: number;
}

export interface LLMCompleteOutput {
  /** Raw model text (often JSON for structured tasks). */
  readonly text: string;
}

export interface LLMProvider {
  complete(input: LLMCompleteInput): Promise<LLMCompleteOutput>;
}
