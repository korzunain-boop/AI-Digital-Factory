import type {
  GeneratedImage,
  GeneratedImages,
  ImageGenerationRequest,
  ImageProvider,
} from './image-provider.js';

/**
 * Fake ImageProvider (Milestone M7).
 *
 * Responsibility:
 *   Return deterministic fake image assets matching the former Clipart M6 inline output
 *   (ids, filenames, memory:// locations, tags, preview descriptors).
 *
 * Non-goals:
 *   No OpenAI, Flux, Ideogram, HTTP, filesystem, or SDKs.
 *   Replaceable later by a real ImageProvider without changing ClipartGeneratorStrategy's
 *   dependency shape (constructor-injected ImageProvider).
 */
export class FakeImageProvider implements ImageProvider {
  /** Counts generateImages invocations for tests. */
  invocationCount = 0;

  /**
   * When set, generateImages throws (Engine/strategy exception paths).
   */
  readonly throwError?: Error;

  constructor(options: { throwError?: Error } = {}) {
    this.throwError = options.throwError;
  }

  async generateImages(request: ImageGenerationRequest): Promise<GeneratedImages> {
    this.invocationCount += 1;

    if (this.throwError) {
      throw this.throwError;
    }

    if (request.count < 1) {
      return { images: [] };
    }

    const images: GeneratedImage[] = [];
    for (let i = 1; i <= request.count; i += 1) {
      images.push(buildFakeImage(request, i));
    }
    return { images };
  }
}

function buildFakeImage(request: ImageGenerationRequest, index: number): GeneratedImage {
  const padded = String(index).padStart(2, '0');
  const slugTheme = slugify(request.theme);
  const slugStyle = slugify(request.style);
  const fileBase = `${slugTheme}-${slugStyle}-${padded}`;
  const width = request.width ?? 2048;
  const height = request.height ?? 2048;
  const tags = ['clipart', 'digital download', slugTheme, slugStyle, `${slugTheme} clipart`];

  return {
    assetId: `clipart-asset-${request.requestId}-${padded}`,
    name: `${fileBase}.png`,
    mediaType: 'image/png',
    location: `memory://clipart/${request.requestId}/${fileBase}.png`,
    metadata: {
      index,
      theme: request.theme,
      style: request.style,
      width,
      height,
      format: 'png',
      transparentBackground: true,
      tags: tags.join(','),
      previewDescriptor: `preview:${fileBase}@512`,
      promptDescriptor: `clipart/${slugStyle}/${slugTheme}#${padded}`,
      assetId: `clipart-asset-${request.requestId}-${padded}`,
      purpose: request.purpose ?? 'clipart',
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
