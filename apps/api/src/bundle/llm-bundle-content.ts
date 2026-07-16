import type { LLMProvider } from '@ai-product-factory/domain';

import { parseStyleGuide, type StyleGuide } from './style-guide.js';

export const DEFAULT_ILLUSTRATION_COUNT = 24;

/**
 * Ask the LLM for a Style Guide (once per bundle).
 */
export async function generateStyleGuideWithLLM(
  llm: LLMProvider,
  theme: string,
): Promise<StyleGuide> {
  const result = await llm.complete({
    purpose: 'style-guide',
    system:
      'You are an art director for digital marketplace illustration packs. Reply with JSON only.',
    prompt: [
      'Generate one Style Guide JSON object for an illustration collection.',
      `theme: ${theme}`,
      'Required keys: theme, palette (string array), illustrationStyle, composition, lighting, mood, negativeConstraints.',
      'No markdown. JSON only.',
    ].join('\n'),
  });

  return parseStyleGuide(parseJsonObject(result.text), theme);
}

/**
 * Ask the LLM for illustration subjects for the theme.
 */
export async function generateSubjectsWithLLM(
  llm: LLMProvider,
  theme: string,
  styleGuide: StyleGuide,
  count: number,
): Promise<string[]> {
  const result = await llm.complete({
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

/**
 * Ask the LLM for one image prompt per subject, all following the Style Guide.
 */
export async function generatePromptsWithLLM(
  llm: LLMProvider,
  styleGuide: StyleGuide,
  subjects: readonly string[],
): Promise<string[]> {
  const result = await llm.complete({
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
    throw new Error(`LLM prompts contained invalid entries (expected ${subjects.length} strings)`);
  }
  return cleaned;
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
