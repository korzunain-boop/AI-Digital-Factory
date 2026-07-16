/**
 * Product Sprint 1 — illustration collection bundle (no layout/PDF/ZIP).
 */

export type { StyleGuide } from './style-guide.js';
export { generateStyleGuide } from './style-guide.js';

export { DEFAULT_ILLUSTRATION_COUNT, generateIllustrationList } from './illustration-list.js';

export { composeIllustrationPrompt, composeIllustrationPrompts } from './prompt-composer.js';

export {
  PLACEHOLDER_PNG,
  resolveImageBytes,
  saveBundleArtifacts,
  slugifyFileName,
} from './save-bundle.js';
export type { BundleIllustrationRecord, BundleManifest, PromptsFile } from './save-bundle.js';

export { generateIllustrationBundle } from './bundle-generator.js';
export type { GenerateBundleInput, GenerateBundleResult } from './bundle-generator.js';
