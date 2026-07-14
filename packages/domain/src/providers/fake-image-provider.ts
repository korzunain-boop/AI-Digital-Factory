import type { ImageGenerationPrompt } from '../prompts/image-generation-prompt.js';
import type { GeneratedImage, GeneratedImages, ImageProvider } from './image-provider.js';

/**
 * Fake ImageProvider (Milestone M7 + M8).
 *
 * Responsibility:
 *   Return deterministic fake image assets from {@link ImageGenerationPrompt}
 *   (ids, filenames, memory:// locations, tags, preview descriptors).
 *
 * Receives ImageGenerationPrompt only — never GenerationRequest.
 */
export class FakeImageProvider implements ImageProvider {
  /** Counts generateImages invocations for tests. */
  invocationCount = 0;

  /** Last prompt received (for tests). */
  lastPrompt?: ImageGenerationPrompt;

  /**
   * When set, generateImages throws (Engine/strategy exception paths).
   */
  readonly throwError?: Error;

  constructor(options: { throwError?: Error } = {}) {
    this.throwError = options.throwError;
  }

  async generateImages(prompt: ImageGenerationPrompt): Promise<GeneratedImages> {
    this.invocationCount += 1;
    this.lastPrompt = prompt;

    if (this.throwError) {
      throw this.throwError;
    }

    if (prompt.count < 1) {
      return { images: [] };
    }

    const images: GeneratedImage[] = [];
    for (let i = 1; i <= prompt.count; i += 1) {
      images.push(buildFakeImage(prompt, i));
    }
    return { images };
  }
}

function buildFakeImage(prompt: ImageGenerationPrompt, index: number): GeneratedImage {
  const padded = String(index).padStart(2, '0');
  const slugTheme = slugify(prompt.theme);
  const slugStyle = slugify(prompt.style);
  const fileBase = `${slugTheme}-${slugStyle}-${padded}`;
  const width = prompt.width;
  const height = prompt.height;
  const tags = ['clipart', 'digital download', slugTheme, slugStyle, `${slugTheme} clipart`];
  const itemPrompt = prompt.prompts[index - 1] ?? '';

  return {
    assetId: `clipart-asset-${prompt.requestId}-${padded}`,
    name: `${fileBase}.png`,
    mediaType: 'image/png',
    location: `memory://clipart/${prompt.requestId}/${fileBase}.png`,
    metadata: {
      index,
      theme: prompt.theme,
      style: prompt.style,
      width,
      height,
      format: 'png',
      transparentBackground: true,
      tags: tags.join(','),
      previewDescriptor: `preview:${fileBase}@512`,
      promptDescriptor: `clipart/${slugStyle}/${slugTheme}#${padded}`,
      promptText: itemPrompt,
      assetId: `clipart-asset-${prompt.requestId}-${padded}`,
      purpose: prompt.purpose,
    },
  };
}

function slugify(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'item'
  );
}
