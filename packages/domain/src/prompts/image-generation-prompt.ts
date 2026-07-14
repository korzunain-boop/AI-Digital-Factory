/**
 * Structured image-generation prompt produced by {@link PromptBuilder}.
 * ImageProvider receives this — never a raw GenerationRequest.
 */
export interface ImageGenerationPrompt {
  /** Correlates outputs to GenerationRequest.id. */
  readonly requestId: string;

  /** How many images to produce (matches prompts.length). */
  readonly count: number;

  /** Theme / niche from the generator template. */
  readonly theme: string;

  /** Visual style from the generator template. */
  readonly style: string;

  /** Purpose tag (e.g. "clipart"). */
  readonly purpose: string;

  readonly width: number;
  readonly height: number;

  /**
   * Deterministic prompt strings, one per image (index order).
   * Future OpenAI/Flux adapters send these (or a derived form) to the model API.
   */
  readonly prompts: readonly string[];

  /** Optional negative prompt shared across the batch. */
  readonly negativePrompt: string;
}
