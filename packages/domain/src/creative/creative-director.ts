import type { StyleGuide } from './style-guide.js';

export const DEFAULT_ILLUSTRATION_COUNT = 24;

/**
 * CreativeDirector — Domain service for bundle creative identity.
 *
 * Responsibilities:
 * 1. Create Style Guide
 * 2. Create illustration subjects
 * 3. Create image prompts
 * 4. Ensure consistency across the entire bundle (Style Guide threaded through)
 *
 * Domain depends on this abstraction only — not on LLMProvider.
 * Infrastructure may implement via LLM (e.g. LLMCreativeDirector).
 */
export interface CreativeDirector {
  /**
   * Create the Style Guide once for the theme (locked for the pack).
   */
  createStyleGuide(theme: string): Promise<StyleGuide>;

  /**
   * Create illustration subjects consistent with the Style Guide.
   */
  createSubjects(input: {
    readonly theme: string;
    readonly styleGuide: StyleGuide;
    readonly count: number;
  }): Promise<string[]>;

  /**
   * Create one image prompt per subject, all following the same Style Guide.
   */
  createPrompts(input: {
    readonly styleGuide: StyleGuide;
    readonly subjects: readonly string[];
  }): Promise<string[]>;
}
