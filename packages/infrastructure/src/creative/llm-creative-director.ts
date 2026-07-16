import {
  parseProductMetadata,
  parseStyleGuide,
  type CreativeDirector,
  type LLMProvider,
  type ProductMetadata,
  type ProductMetadataInput,
  type StyleGuide,
} from '@ai-product-factory/domain';

/**
 * Infrastructure CreativeDirector backed by {@link LLMProvider}.
 *
 * Domain depends only on CreativeDirector; LLM is an implementation detail here.
 */
export class LLMCreativeDirector implements CreativeDirector {
  constructor(private readonly llm: LLMProvider) {}

  async createStyleGuide(theme: string): Promise<StyleGuide> {
    const cleaned = theme.trim();
    const result = await this.llm.complete({
      purpose: 'style-guide',
      system:
        'You are an art director for digital marketplace illustration packs. Reply with JSON only.',
      prompt: [
        'Generate one Style Guide JSON object for an illustration collection.',
        `theme: ${cleaned}`,
        'Required keys: theme, palette (string array), illustrationStyle, composition, lighting, mood, negativeConstraints.',
        'No markdown. JSON only.',
      ].join('\n'),
    });

    return parseStyleGuide(parseJsonObject(result.text), cleaned);
  }

  async createSubjects(input: {
    readonly theme: string;
    readonly styleGuide: StyleGuide;
    readonly count: number;
  }): Promise<string[]> {
    const { theme, styleGuide, count } = input;
    const result = await this.llm.complete({
      purpose: 'illustration-subjects',
      system:
        'You invent distinct illustration subjects for a cohesive marketplace pack. Reply with JSON only.',
      prompt: [
        'Generate illustration subjects for this collection.',
        `theme: ${theme}`,
        `count: ${count}`,
        `illustrationStyle: ${styleGuide.illustrationStyle}`,
        `mood: ${styleGuide.mood}`,
        'Return JSON: {"subjects":["..."]} with exactly `count` unique subject names.',
        'No markdown. JSON only.',
      ].join('\n'),
    });

    const parsed = parseJsonObject(result.text);
    const subjects = (parsed as { subjects?: unknown }).subjects;
    if (!Array.isArray(subjects) || subjects.length !== count) {
      throw new Error(
        `LLM subjects must be an array of length ${count} (got ${Array.isArray(subjects) ? subjects.length : typeof subjects})`,
      );
    }
    const cleaned = subjects
      .filter((s): s is string => typeof s === 'string')
      .map((s) => s.trim())
      .filter(Boolean);
    if (cleaned.length !== count) {
      throw new Error(`LLM subjects contained invalid entries (expected ${count} strings)`);
    }
    return cleaned;
  }

  async createPrompts(input: {
    readonly styleGuide: StyleGuide;
    readonly subjects: readonly string[];
  }): Promise<string[]> {
    const { styleGuide, subjects } = input;
    const result = await this.llm.complete({
      purpose: 'illustration-prompts',
      system:
        'You write image-generation prompts. Keep style identical across the pack; only the subject changes. JSON only.',
      prompt: [
        'Generate one image prompt per subject.',
        `theme: ${styleGuide.theme}`,
        `count: ${subjects.length}`,
        `illustrationStyle: ${styleGuide.illustrationStyle}`,
        `composition: ${styleGuide.composition}`,
        `lighting: ${styleGuide.lighting}`,
        `mood: ${styleGuide.mood}`,
        `palette: ${styleGuide.palette.join(', ')}`,
        `negativeConstraints: ${styleGuide.negativeConstraints}`,
        `subjects_json: ${JSON.stringify(subjects)}`,
        'Return JSON: {"prompts":["..."]} with the same length and order as subjects.',
        'Each prompt must embed the Style Guide and change only the subject.',
        'No markdown. JSON only.',
      ].join('\n'),
    });

    const parsed = parseJsonObject(result.text);
    const prompts = (parsed as { prompts?: unknown }).prompts;
    if (!Array.isArray(prompts) || prompts.length !== subjects.length) {
      throw new Error(
        `LLM prompts must be an array of length ${subjects.length} (got ${Array.isArray(prompts) ? prompts.length : typeof prompts})`,
      );
    }
    const cleaned = prompts
      .filter((p): p is string => typeof p === 'string')
      .map((p) => p.trim())
      .filter(Boolean);
    if (cleaned.length !== subjects.length) {
      throw new Error(
        `LLM prompts contained invalid entries (expected ${subjects.length} strings)`,
      );
    }
    return cleaned;
  }

  async createProductMetadata(input: ProductMetadataInput): Promise<ProductMetadata> {
    const theme = input.theme.trim() || input.styleGuide.theme;
    const primaryHint = input.styleGuide.palette[0] ?? '#F5F0E8';
    const secondaryHint = input.styleGuide.palette[1] ?? '#D4A373';
    const result = await this.llm.complete({
      purpose: 'product-metadata',
      system:
        'You write marketplace-agnostic commercial metadata for digital art bundles. Reply with JSON only.',
      prompt: [
        'Generate commercial product metadata for a printable illustration / poster bundle.',
        `theme: ${theme}`,
        `poster_count: ${input.posters.length}`,
        `primary_color_hint: ${primaryHint}`,
        `secondary_color_hint: ${secondaryHint}`,
        `illustrationStyle: ${input.styleGuide.illustrationStyle}`,
        `mood: ${input.styleGuide.mood}`,
        `palette: ${input.styleGuide.palette.join(', ')}`,
        `posters_json: ${JSON.stringify(input.posters)}`,
        `subjects_json: ${JSON.stringify(input.subjects ?? [])}`,
        'Return JSON with keys: title, shortDescription, longDescription, tags (exactly 13 strings),',
        'materials (string array), primaryColor, secondaryColor, occasion, room, ageGroup, seoKeywords (string array).',
        'longDescription should be Etsy-ready listing copy but reusable on other marketplaces.',
        'No markdown. JSON only.',
      ].join('\n'),
    });

    return parseProductMetadata(parseJsonObject(result.text));
  }
}

function parseJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  const raw = fence?.[1]?.trim() ?? trimmed;
  try {
    return JSON.parse(raw) as unknown;
  } catch (cause) {
    throw new Error(`LLM response is not valid JSON: ${String(cause)}`);
  }
}
