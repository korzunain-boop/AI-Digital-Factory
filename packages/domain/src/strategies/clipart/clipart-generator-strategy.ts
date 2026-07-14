import type {
  AssetBundle,
  AssetItem,
  GenerationRequest,
  GenerationResult,
} from '../../objects/index.js';
import type { StrategyKey } from '../../objects/ids.js';
import type { PromptBuilder } from '../../prompts/prompt-builder.js';
import { DefaultPromptBuilder } from '../../prompts/default-prompt-builder.js';
import type { GeneratedImages, ImageProvider } from '../../providers/image-provider.js';
import type { GeneratorStrategy } from '../generator-strategy.js';
import {
  CLIPART_STRATEGY_KEY,
  parseClipartTemplate,
  type ClipartGeneratorTemplate,
} from './clipart-template.js';

/**
 * First commercial GeneratorStrategy: Clipart (M6–M8).
 *
 * Responsibility:
 *   Parse ClipartGeneratorTemplate → PromptBuilder → ImageProvider →
 *   assemble AssetBundle → GenerationResult.
 *
 * M8:
 *   Does not pass template fields directly to ImageProvider.
 *   PromptBuilder owns prompt construction; ImageProvider receives ImageGenerationPrompt only.
 *
 * Engine integration:
 *   Registers under {@link CLIPART_STRATEGY_KEY}; DefaultGeneratorEngine unchanged.
 */
export class ClipartGeneratorStrategy implements GeneratorStrategy {
  readonly key: StrategyKey = CLIPART_STRATEGY_KEY;

  private readonly images: ImageProvider;
  private readonly prompts: PromptBuilder;

  /**
   * @param images ImageProvider used to produce GeneratedImages (required).
   * @param prompts PromptBuilder for ImageGenerationPrompt (defaults to DefaultPromptBuilder).
   */
  constructor(images: ImageProvider, prompts: PromptBuilder = new DefaultPromptBuilder()) {
    this.images = images;
    this.prompts = prompts;
  }

  /**
   * Generate a clipart AssetBundle via PromptBuilder + ImageProvider.
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

    const prompt = this.prompts.build({
      request,
      template: effectiveTemplate,
    });

    let generated: GeneratedImages;
    try {
      generated = await this.images.generateImages(prompt);
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
