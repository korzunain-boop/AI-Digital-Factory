import type {
  AssetBundle,
  AssetItem,
  GenerationRequest,
  GenerationResult,
} from '../../objects/index.js';
import type { StrategyKey } from '../../objects/ids.js';
import type { GeneratorStrategy } from '../generator-strategy.js';
import {
  CLIPART_STRATEGY_KEY,
  parseClipartTemplate,
  type ClipartGeneratorTemplate,
} from './clipart-template.js';

/**
 * First commercial GeneratorStrategy: Clipart (Milestone M6 skeleton).
 *
 * Responsibility:
 *   Accept GenerationRequest → apply ClipartGeneratorTemplate (theme, style, assetCount)
 *   → produce a realistic AssetBundle + GenerationResult.
 *
 * M6 behavior:
 *   Deterministic fake assets (ids, filenames, metadata, tags, preview descriptors).
 *   No OpenAI, image APIs, or filesystem I/O.
 *   Locations use opaque `memory://…` URIs — future ImageProvider/StorageProvider
 *   can replace byte production without changing Engine or this strategy's contract.
 *
 * Engine integration:
 *   Registers under {@link CLIPART_STRATEGY_KEY}; DefaultGeneratorEngine needs no changes.
 */
export class ClipartGeneratorStrategy implements GeneratorStrategy {
  readonly key: StrategyKey = CLIPART_STRATEGY_KEY;

  /**
   * Generate a clipart AssetBundle for the request.
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

    const assetBundle = buildClipartAssetBundle(request, effectiveTemplate);

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
 * Build a deterministic AssetBundle shaped like future image-provider output.
 */
export function buildClipartAssetBundle(
  request: GenerationRequest,
  template: ClipartGeneratorTemplate,
): AssetBundle {
  const assets: AssetItem[] = [];
  for (let i = 1; i <= template.assetCount; i += 1) {
    assets.push(buildClipartAsset(request.id, template, i));
  }

  const tags = buildTags(template);

  return {
    id: `clipart-bundle-${request.id}`,
    generationRequestId: request.id,
    assets,
    metadata: {
      productType: 'clipart',
      strategyKey: CLIPART_STRATEGY_KEY,
      theme: template.theme,
      style: template.style,
      assetCount: template.assetCount,
      tags: tags.join(','),
      researchBriefId: request.researchBriefId,
      listingTitleHint: `${titleCase(template.theme)} ${titleCase(template.style)} Clipart Pack`,
    },
    createdAt: request.createdAt,
  };
}

function buildClipartAsset(
  requestId: string,
  template: ClipartGeneratorTemplate,
  index: number,
): AssetItem {
  const padded = String(index).padStart(2, '0');
  const slugTheme = slugify(template.theme);
  const slugStyle = slugify(template.style);
  const fileBase = `${slugTheme}-${slugStyle}-${padded}`;

  return {
    name: `${fileBase}.png`,
    mediaType: 'image/png',
    /**
     * Opaque storage location — not a filesystem path.
     * Future StorageProvider / ImageProvider write real bytes behind this URI scheme.
     */
    location: `memory://clipart/${requestId}/${fileBase}.png`,
    metadata: {
      index,
      theme: template.theme,
      style: template.style,
      width: 2048,
      height: 2048,
      format: 'png',
      transparentBackground: true,
      tags: buildTags(template).join(','),
      previewDescriptor: `preview:${fileBase}@512`,
      promptDescriptor: `clipart/${slugStyle}/${slugTheme}#${padded}`,
      assetId: `clipart-asset-${requestId}-${padded}`,
    },
  };
}

function buildTags(template: ClipartGeneratorTemplate): string[] {
  return [
    'clipart',
    'digital download',
    slugify(template.theme),
    slugify(template.style),
    `${slugify(template.theme)} clipart`,
  ];
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
