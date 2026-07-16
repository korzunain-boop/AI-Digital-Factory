/**
 * Marketplace-agnostic commercial metadata for a digital product bundle.
 *
 * Field shapes are portable across Etsy, Gumroad, Creative Market, etc.
 * Channel-specific adapters (later) map this object without regenerating copy.
 */
export interface ProductMetadata {
  readonly title: string;
  readonly shortDescription: string;
  /** Full listing description (Etsy-ready length/tone; reusable elsewhere). */
  readonly longDescription: string;
  /** Exactly 13 tags for Etsy; other markets may subset. */
  readonly tags: readonly string[];
  readonly materials: readonly string[];
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly occasion: string;
  readonly room: string;
  readonly ageGroup: string;
  readonly seoKeywords: readonly string[];
}

export const ETSY_TAG_COUNT = 13;

export interface ProductMetadataInput {
  readonly theme: string;
  readonly styleGuide: import('./style-guide.js').StyleGuide;
  /** Poster titles / files from the printable pack. */
  readonly posters: readonly { readonly title: string; readonly file: string }[];
  /** Optional illustration subjects from the bundle. */
  readonly subjects?: readonly string[];
}

/**
 * Validate and normalize structured JSON into ProductMetadata.
 */
export function parseProductMetadata(value: unknown): ProductMetadata {
  if (!value || typeof value !== 'object') {
    throw new Error('Product metadata must be a JSON object');
  }
  const obj = value as Record<string, unknown>;

  const requireString = (key: string): string => {
    const v = obj[key];
    if (typeof v !== 'string' || !v.trim()) {
      throw new Error(`Product metadata missing string field: ${key}`);
    }
    return v.trim();
  };

  const requireStringArray = (key: string, minLength = 1): string[] => {
    const v = obj[key];
    if (!Array.isArray(v)) {
      throw new Error(`Product metadata field ${key} must be an array`);
    }
    const cleaned = v
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);
    if (cleaned.length < minLength) {
      throw new Error(`Product metadata field ${key} must have at least ${minLength} entries`);
    }
    return cleaned;
  };

  const tags = requireStringArray('tags', ETSY_TAG_COUNT);
  if (tags.length !== ETSY_TAG_COUNT) {
    throw new Error(`Product metadata tags must have exactly ${ETSY_TAG_COUNT} entries`);
  }

  return {
    title: requireString('title'),
    shortDescription: requireString('shortDescription'),
    longDescription: requireString('longDescription'),
    tags,
    materials: requireStringArray('materials'),
    primaryColor: requireString('primaryColor'),
    secondaryColor: requireString('secondaryColor'),
    occasion: requireString('occasion'),
    room: requireString('room'),
    ageGroup: requireString('ageGroup'),
    seoKeywords: requireStringArray('seoKeywords'),
  };
}
