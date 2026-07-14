import type { StorageLocation } from '../objects/ids.js';

/**
 * Batch image generation request for {@link ImageProvider.generateImages}.
 * Product-agnostic — strategies supply theme/style/count; providers produce image descriptors.
 */
export interface ImageGenerationRequest {
  /** Correlates outputs to a GenerationRequest id. */
  readonly requestId: string;

  /** How many images to produce. */
  readonly count: number;

  /** Theme / niche hint for prompts or naming. */
  readonly theme: string;

  /** Visual style hint. */
  readonly style: string;

  /** Optional purpose tag (e.g. "clipart", "preview"). */
  readonly purpose?: string;

  readonly width?: number;
  readonly height?: number;
}

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
 * ImageProvider port (Milestone M7).
 *
 * Responsibility ONLY:
 *   generateImages(request) → GeneratedImages
 *
 * No marketplace, filesystem, or SDK types in this contract.
 * FakeImageProvider supplies deterministic descriptors; a future OpenAI/Flux adapter
 * implements the same method without changing GeneratorEngine or strategy contracts.
 */
export interface ImageProvider {
  /**
   * Generate (or describe) a batch of images for the request.
   */
  generateImages(request: ImageGenerationRequest): Promise<GeneratedImages>;
}
