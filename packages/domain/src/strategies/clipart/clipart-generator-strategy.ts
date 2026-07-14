import type {
  AssetBundle,
  AssetItem,
  GenerationRequest,
  GenerationResult,
} from '../../objects/index.js';
import type { StrategyKey } from '../../objects/ids.js';
import type { GeneratedImages, ImageProvider } from '../../providers/image-provider.js';
import type { GeneratorStrategy } from '../generator-strategy.js';
import {
  CLIPART_STRATEGY_KEY,
  parseClipartTemplate,
  type ClipartGeneratorTemplate,
} from './clipart-template.js';

/**
 * First commercial GeneratorStrategy: Clipart (M6 + M7).
 *
 * Responsibility:
 *   Parse ClipartGeneratorTemplate → call ImageProvider.generateImages →
 *   assemble AssetBundle → GenerationResult.
 *
 * M7:
 *   Does NOT build image assets itself. Image generation is delegated to ImageProvider
 *   (FakeImageProvider for now; OpenAI/Flux later behind the same port).
 *
 * Engine integration:
 *   Registers under {@link CLIPART_STRATEGY_KEY}; DefaultGeneratorEngine unchanged.
 */
export class ClipartGeneratorStrategy implements GeneratorStrategy {
  readonly key: StrategyKey = CLIPART_STRATEGY_KEY;

  /**
   * @param images ImageProvider used to produce GeneratedImages (required).
   */
  constructor(private readonly images: ImageProvider) {}

  /**
   * Generate a clipart AssetBundle via ImageProvider.
   */
  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const parsed = parseClipartTemplate(request.template);
    if (!parsed.ok) {
      return {
        ok: false,
        generationRequestId: request.id,
        errors: parsed.errors,
        approximateCost: 0,
      };
    }

    const template = parsed.template;
    const effectiveCount = resolveAssetCount(template, request.limits.maxAssets);
    const effectiveTemplate: ClipartGeneratorTemplate = {
      ...template,
      assetCount: effectiveCount,
    };

    let generated: GeneratedImages;
    try {
      generated = await this.images.generateImages({
        requestId: request.id,
        count: effectiveTemplate.assetCount,
        theme: effectiveTemplate.theme,
        style: effectiveTemplate.style,
        purpose: 'clipart',
        width: 2048,
        height: 2048,
      });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'ImageProvider failed';
      return {
        ok: false,
        generationRequestId: request.id,
        errors: [`IMAGE_PROVIDER_FAILED: ${message}`],
        approximateCost: 0,
      };
    }

    const assetBundle = assembleClipartAssetBundle(request, effectiveTemplate, generated);

    return {
      ok: true,
      generationRequestId: request.id,
      assetBundleId: assetBundle.id,
      assetBundle,
      approximateCost: 0,
    };
  }
}

/**
 * Cap template assetCount by GenerationLimits.maxAssets when provided.
 */
function resolveAssetCount(template: ClipartGeneratorTemplate, maxAssets?: number): number {
  if (maxAssets === undefined) {
    return template.assetCount;
  }
  return Math.min(template.assetCount, Math.max(1, Math.trunc(maxAssets)));
}

/**
 * Map provider GeneratedImages into a Domain AssetBundle with clipart pack metadata.
 * Does not invent pixels — only wraps provider descriptors + listing hints.
 */
export function assembleClipartAssetBundle(
  request: GenerationRequest,
  template: ClipartGeneratorTemplate,
  generated: GeneratedImages,
): AssetBundle {
  const assets: AssetItem[] = generated.images.map((image) => ({
    name: image.name,
    mediaType: image.mediaType,
    location: image.location,
    metadata: {
      ...image.metadata,
      assetId: image.assetId,
      theme: template.theme,
      style: template.style,
    },
  }));

  const tags = [
    'clipart',
    'digital download',
    slugify(template.theme),
    slugify(template.style),
    `${slugify(template.theme)} clipart`,
  ];

  return {
    id: `clipart-bundle-${request.id}`,
    generationRequestId: request.id,
    assets,
    metadata: {
      productType: 'clipart',
      strategyKey: CLIPART_STRATEGY_KEY,
      theme: template.theme,
      style: template.style,
      assetCount: assets.length,
      tags: tags.join(','),
      researchBriefId: request.researchBriefId,
      listingTitleHint: `${titleCase(template.theme)} ${titleCase(template.style)} Clipart Pack`,
    },
    createdAt: request.createdAt,
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

function titleCase(value: string): string {
  return value
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}
