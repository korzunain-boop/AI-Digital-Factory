/**
 * Product Sprint 1 — Style Guide (generated once per bundle, reused for every prompt).
 */

export interface StyleGuide {
  readonly theme: string;
  readonly palette: readonly string[];
  readonly illustrationStyle: string;
  readonly composition: string;
  readonly lighting: string;
  readonly mood: string;
  readonly negativeConstraints: string;
}

const PALETTE_PRESETS: readonly (readonly string[])[] = [
  ['#F7E7CE', '#A8D5BA', '#F4A261', '#E76F51', '#2A9D8F'],
  ['#FFF5E6', '#FFD6E0', '#C9E4DE', '#B8C0FF', '#F2CC8F'],
  ['#E8F1F2', '#B3C5D7', '#F6D6AD', '#D4A373', '#6B705C'],
  ['#F9F7F3', '#E6CCB2', '#A5A58D', '#6B705C', '#CB997E'],
];

/**
 * Build a deterministic Style Guide from a theme.
 * No LLM — stable for tests and reused across all illustration prompts.
 */
export function generateStyleGuide(theme: string): StyleGuide {
  const cleaned = theme.trim() || 'Generic';
  const palette =
    PALETTE_PRESETS[hashTheme(cleaned) % PALETTE_PRESETS.length] ?? PALETTE_PRESETS[0]!;

  return {
    theme: cleaned,
    palette,
    illustrationStyle:
      'soft marketplace clipart illustration, clean vector-friendly shapes, gentle outlines, cohesive character design',
    composition:
      'single centered subject, simple uncluttered scene, generous negative space, square framing',
    lighting: 'soft diffused daylight, even exposure, no harsh shadows',
    mood: 'warm, calm, friendly, premium digital-download aesthetic',
    negativeConstraints:
      'text, watermark, logo, signature, photorealistic, photograph, scary, violent, cluttered background, multiple subjects, low quality, blurry',
  };
}

function hashTheme(theme: string): number {
  let h = 0;
  for (let i = 0; i < theme.length; i += 1) {
    h = (h * 31 + theme.charCodeAt(i)) >>> 0;
  }
  return h;
}
