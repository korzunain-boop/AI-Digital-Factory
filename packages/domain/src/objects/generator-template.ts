/**
 * Data-driven template parameters composed by a GeneratorStrategy.
 * Structure only — interpretation belongs entirely inside the strategy.
 */
export interface GeneratorTemplateParams {
  /**
   * Opaque key/value bag for theme, style, counts, naming patterns, etc.
   * No product-specific fields at the Domain contract layer.
   */
  readonly values: Readonly<Record<string, string | number | boolean | null>>;
}
