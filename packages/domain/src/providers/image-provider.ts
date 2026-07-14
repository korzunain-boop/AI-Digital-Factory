import type { StorageLocation } from '../objects/ids.js';

/**
 * Image generation/transform request used by strategies (and optionally previews).
 */
export interface ImageGenerateInput {
  readonly prompt: string;
  readonly purpose?: string;
  readonly width?: number;
  readonly height?: number;
}

/**
 * Image generation result referencing a storage location for bytes.
 */
export interface ImageGenerateOutput {
  readonly location: StorageLocation;
  readonly mediaType: string;
}

/**
 * Image provider port.
 * No OpenAI/image-vendor SDK types here.
 */
export interface ImageProvider {
  generate(input: ImageGenerateInput): Promise<ImageGenerateOutput>;
}
