import type { StyleGuide } from './style-guide.js';
import type { ProductMetadata, ProductMetadataInput } from './product-metadata.js';

export const DEFAULT_ILLUSTRATION_COUNT = 24;

/**
 * CreativeDirector — Domain service for bundle creative identity + commercial copy.
 *
 * Responsibilities:
 * 1. Create Style Guide
 * 2. Create illustration subjects
 * 3. Create image prompts
 * 4. Ensure consistency across the entire bundle (Style Guide threaded through)
 * 5. Create commercial product metadata (listing copy / attributes)
 *
 * Domain depends on this abstraction only — not on LLMProvider.
 * Infrastructure may implement via LLM (e.g. LLMCreativeDirector).
 */
export interface CreativeDirector {
  createStyleGuide(theme: string): Promise<StyleGuide>;

  createSubjects(input: {
    readonly theme: string;
    readonly styleGuide: StyleGuide;
    readonly count: number;
  }): Promise<string[]>;

  createPrompts(input: {
    readonly styleGuide: StyleGuide;
    readonly subjects: readonly string[];
  }): Promise<string[]>;

  /**
   * Create marketplace-agnostic commercial metadata for the finished pack.
   */
  createProductMetadata(input: ProductMetadataInput): Promise<ProductMetadata>;
}
