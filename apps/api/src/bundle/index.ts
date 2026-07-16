/**
 * Product Sprint 2–4 — illustration collection bundle.
 * Creative identity via Domain {@link CreativeDirector}; images via ImageProvider.
 */

export {
  PLACEHOLDER_PNG,
  resolveImageBytes,
  saveBundleArtifacts,
  slugifyFileName,
} from './save-bundle.js';
export type { BundleIllustrationRecord, BundleManifest, PromptsFile } from './save-bundle.js';

export { generateIllustrationBundle } from './bundle-generator.js';
export type { GenerateBundleInput, GenerateBundleResult } from './bundle-generator.js';

export { generatePostersFromBundle } from './generate-posters.js';

export { ProductMetadataGenerator } from './generate-metadata.js';
export type { GenerateMetadataResult, PosterListItem } from './generate-metadata.js';
