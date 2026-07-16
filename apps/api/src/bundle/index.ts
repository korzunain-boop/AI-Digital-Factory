/**
 * Product Sprint 1 — illustration collection bundle (no layout/PDF/ZIP).
 * Content (Style Guide, subjects, prompts) is LLM-generated via LLMProvider.
 */

export type { StyleGuide } from './style-guide.js';
export { parseStyleGuide } from './style-guide.js';

export {
  DEFAULT_ILLUSTRATION_COUNT,
  generateStyleGuideWithLLM,
  generateSubjectsWithLLM,
  generatePromptsWithLLM,
} from './llm-bundle-content.js';

export {
  PLACEHOLDER_PNG,
  resolveImageBytes,
  saveBundleArtifacts,
  slugifyFileName,
} from './save-bundle.js';
export type { BundleIllustrationRecord, BundleManifest, PromptsFile } from './save-bundle.js';

export { generateIllustrationBundle } from './bundle-generator.js';
export type { GenerateBundleInput, GenerateBundleResult } from './bundle-generator.js';
