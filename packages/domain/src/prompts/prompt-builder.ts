import type { GenerationRequest } from '../objects/generation-request.js';
import type { ClipartGeneratorTemplate } from '../strategies/clipart/clipart-template.js';
import type { ImageGenerationPrompt } from './image-generation-prompt.js';

/**
 * Input to {@link PromptBuilder.build}.
 * GenerationRequest + resolved generator template (MVP: Clipart template fields).
 */
export interface PromptBuilderInput {
  readonly request: GenerationRequest;
  readonly template: ClipartGeneratorTemplate;
}

/**
 * PromptBuilder port (Milestone M8).
 *
 * Responsibility ONLY:
 *   GenerationRequest + GeneratorTemplate → ImageGenerationPrompt
 *
 * Owns prompt construction. ImageProvider never sees GenerationRequest.
 * No LLM, HTTP, or prompt optimization in DefaultPromptBuilder.
 */
export interface PromptBuilder {
  /**
   * Build a structured ImageGenerationPrompt from the request and template.
   */
  build(input: PromptBuilderInput): ImageGenerationPrompt;
}
