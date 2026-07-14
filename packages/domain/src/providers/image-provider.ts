import type { StorageLocation } from '../objects/ids.js';
import type { ImageGenerationPrompt } from '../prompts/image-generation-prompt.js';

/**
 * One generated image descriptor (bytes live behind StorageLocation later).
 */
export interface GeneratedImage {
  readonly assetId: string;
  readonly name: string;
  readonly mediaType: string;
  readonly location: StorageLocation;
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
}

/**
 * Batch result from {@link ImageProvider.generateImages}.
 */
export interface GeneratedImages {
  readonly images: readonly GeneratedImage[];
}

/**
 * ImageProvider port (M7 + M8).
 *
 * Responsibility ONLY:
 *   generateImages(prompt: ImageGenerationPrompt) → GeneratedImages
 *
 * Never receives GenerationRequest — prompts come from PromptBuilder.
 * FakeImageProvider supplies deterministic descriptors; OpenAI/Flux adapters later
 * implement the same method using {@link ImageGenerationPrompt.prompts}.
 */
export interface ImageProvider {
  /**
   * Generate (or describe) a batch of images from a structured prompt.
   */
  generateImages(prompt: ImageGenerationPrompt): Promise<GeneratedImages>;
}
