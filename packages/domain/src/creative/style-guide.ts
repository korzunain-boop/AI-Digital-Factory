/**
 * Style Guide — creative identity for an illustration collection bundle.
 * Produced by {@link CreativeDirector}; not hardcoded per theme.
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

/**
 * Validate / normalize structured JSON into a StyleGuide.
 */
export function parseStyleGuide(value: unknown, fallbackTheme: string): StyleGuide {
  if (!value || typeof value !== 'object') {
    throw new Error('Style Guide must be a JSON object');
  }
  const obj = value as Record<string, unknown>;
  const theme =
    typeof obj.theme === 'string' && obj.theme.trim() ? obj.theme.trim() : fallbackTheme.trim();

  const palette = Array.isArray(obj.palette)
    ? obj.palette.filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
    : [];
  if (palette.length < 1) {
    throw new Error('Style Guide must include a non-empty palette[]');
  }

  const requireString = (key: string): string => {
    const v = obj[key];
    if (typeof v !== 'string' || !v.trim()) {
      throw new Error(`Style Guide missing string field: ${key}`);
    }
    return v.trim();
  };

  return {
    theme,
    palette,
    illustrationStyle: requireString('illustrationStyle'),
    composition: requireString('composition'),
    lighting: requireString('lighting'),
    mood: requireString('mood'),
    negativeConstraints: requireString('negativeConstraints'),
  };
}
