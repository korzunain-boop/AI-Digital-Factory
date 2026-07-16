import type { StyleGuide } from './style-guide.js';

/**
 * Product Sprint 1 — one prompt per illustration.
 * Same Style Guide every time; only the subject changes.
 */
export function composeIllustrationPrompt(styleGuide: StyleGuide, subject: string): string {
  const palette = styleGuide.palette.join(', ');
  return [
    `Create one high-resolution marketplace illustration of a ${subject}.`,
    `Theme collection: ${styleGuide.theme}.`,
    `Illustration style: ${styleGuide.illustrationStyle}.`,
    `Composition: ${styleGuide.composition}.`,
    `Lighting: ${styleGuide.lighting}.`,
    `Mood: ${styleGuide.mood}.`,
    `Color palette: ${palette}.`,
    'Keep visual consistency with the rest of the collection — same style, palette, lighting, and mood.',
    `Subject only changes: depict ${subject}; do not change the art style.`,
    'Transparent or clean simple background suitable for digital download clipart.',
  ].join(' ');
}

/**
 * Build prompts for every subject using one shared Style Guide.
 */
export function composeIllustrationPrompts(
  styleGuide: StyleGuide,
  subjects: readonly string[],
): string[] {
  return subjects.map((subject) => composeIllustrationPrompt(styleGuide, subject));
}
