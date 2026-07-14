import type { ImageGenerationPrompt } from './image-generation-prompt.js';
import type { PromptBuilder, PromptBuilderInput } from './prompt-builder.js';

/**
 * Default PromptBuilder (Milestone M8).
 *
 * Responsibility:
 *   Deterministic, structured prompts from template theme/style/assetCount.
 *
 * Non-goals:
 *   No AI, LLM, HTTP, or prompt optimization — clean template → prompt mapping only.
 *   Future OpenAI/Flux ImageProviders consume {@link ImageGenerationPrompt.prompts} as-is
 *   (or lightly adapt) without changing this builder's contract.
 */
export class DefaultPromptBuilder implements PromptBuilder {
  build(input: PromptBuilderInput): ImageGenerationPrompt {
    const { request, template } = input;
    const count = template.assetCount;
    const prompts: string[] = [];

    for (let i = 1; i <= count; i += 1) {
      prompts.push(buildItemPrompt(template.theme, template.style, i, count));
    }

    return {
      requestId: request.id,
      count,
      theme: template.theme,
      style: template.style,
      purpose: 'clipart',
      width: 2048,
      height: 2048,
      prompts,
      negativePrompt:
        'text, watermark, logo, blurry, low quality, photorealistic people, photograph',
    };
  }
}

/**
 * Deterministic single-item prompt string (stable for unit tests).
 */
export function buildItemPrompt(
  theme: string,
  style: string,
  index: number,
  total: number,
): string {
  return [
    'Create a high-resolution marketplace clipart illustration.',
    `Theme: ${theme}.`,
    `Style: ${style}.`,
    `Item ${index} of ${total}.`,
    'Transparent background.',
    'Clean edges.',
    'Digital download ready.',
  ].join(' ');
}
