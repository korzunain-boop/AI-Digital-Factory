import type { GeneratorTemplateParams } from '../../objects/generator-template.js';

/**
 * MVP Clipart generator template — intentionally small.
 *
 * Fields:
 * - theme — niche/theme (e.g. "ocean", "wedding")
 * - style — visual style (e.g. "flat", "watercolor")
 * - assetCount — how many clipart assets to produce
 *
 * Not a template framework; Clipart-specific interpretation of GeneratorTemplateParams.
 */
export interface ClipartGeneratorTemplate {
  readonly theme: string;
  readonly style: string;
  readonly assetCount: number;
}

/** Registry key for {@link ClipartGeneratorStrategy}. */
export const CLIPART_STRATEGY_KEY = 'clipart' as const;

const DEFAULT_ASSET_COUNT = 4;
const MAX_ASSET_COUNT = 50;

/**
 * Parse opaque GeneratorTemplateParams into a ClipartGeneratorTemplate.
 * Missing/invalid fields fall back to safe defaults or produce validation errors via return.
 */
export function parseClipartTemplate(
  params: GeneratorTemplateParams,
): { ok: true; template: ClipartGeneratorTemplate } | { ok: false; errors: readonly string[] } {
  const theme = readString(params.values.theme) ?? 'generic';
  const style = readString(params.values.style) ?? 'flat';
  const rawCount = params.values.assetCount;

  let assetCount = DEFAULT_ASSET_COUNT;
  if (typeof rawCount === 'number' && Number.isFinite(rawCount)) {
    assetCount = Math.trunc(rawCount);
  } else if (typeof rawCount === 'string' && rawCount.trim() !== '') {
    const parsed = Number(rawCount);
    if (!Number.isFinite(parsed)) {
      return { ok: false, errors: [`Invalid assetCount: "${rawCount}"`] };
    }
    assetCount = Math.trunc(parsed);
  }

  if (assetCount < 1) {
    return { ok: false, errors: [`assetCount must be >= 1 (got ${assetCount})`] };
  }
  if (assetCount > MAX_ASSET_COUNT) {
    return {
      ok: false,
      errors: [`assetCount must be <= ${MAX_ASSET_COUNT} (got ${assetCount})`],
    };
  }

  return {
    ok: true,
    template: {
      theme: theme.trim() || 'generic',
      style: style.trim() || 'flat',
      assetCount,
    },
  };
}

/**
 * Serialize a ClipartGeneratorTemplate into Domain GeneratorTemplateParams.
 */
export function toClipartTemplateParams(
  template: ClipartGeneratorTemplate,
): GeneratorTemplateParams {
  return {
    values: {
      theme: template.theme,
      style: template.style,
      assetCount: template.assetCount,
    },
  };
}

function readString(value: string | number | boolean | null | undefined): string | undefined {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return undefined;
}
