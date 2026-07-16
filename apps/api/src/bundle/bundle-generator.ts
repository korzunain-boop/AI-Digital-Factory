import type {
  CreativeDirector,
  ImageGenerationPrompt,
  ImageProvider,
  StyleGuide,
} from '@ai-product-factory/domain';
import { DEFAULT_ILLUSTRATION_COUNT } from '@ai-product-factory/domain';

import {
  resolveImageBytes,
  saveBundleArtifacts,
  slugifyFileName,
  type BundleManifest,
} from './save-bundle.js';

export interface GenerateBundleInput {
  readonly theme: string;
  readonly outputDir: string;
  readonly count?: number;
  readonly requestId?: string;
  readonly width?: number;
  readonly height?: number;
}

export interface GenerateBundleResult {
  readonly styleGuide: StyleGuide;
  readonly subjects: readonly string[];
  readonly prompts: readonly string[];
  readonly manifest: BundleManifest;
  readonly outputDir: string;
}

/**
 * Product Sprint 2 orchestrator:
 *
 *   Theme
 *     → CreativeDirector (Style Guide → subjects → prompts)
 *     → ImageProvider (unchanged)
 *     → disk artifacts
 *
 * BundleGenerator depends on CreativeDirector — not LLMProvider.
 * ImageProvider / PromptBuilder / GeneratorEngine unchanged.
 */
export async function generateIllustrationBundle(
  images: ImageProvider,
  director: CreativeDirector,
  input: GenerateBundleInput,
): Promise<GenerateBundleResult> {
  const theme = input.theme.trim();
  if (!theme) {
    throw new Error('Theme is required (e.g. "Nursery Animals").');
  }

  const count = input.count ?? DEFAULT_ILLUSTRATION_COUNT;

  const styleGuide = await director.createStyleGuide(theme);
  const subjects = await director.createSubjects({ theme, styleGuide, count });
  const prompts = await director.createPrompts({ styleGuide, subjects });

  const prompt: ImageGenerationPrompt = {
    requestId: input.requestId ?? `bundle-${Date.now()}`,
    count: subjects.length,
    theme: styleGuide.theme,
    style: styleGuide.illustrationStyle,
    purpose: 'illustration-bundle',
    width: input.width ?? 2048,
    height: input.height ?? 2048,
    prompts,
    negativePrompt: styleGuide.negativeConstraints,
  };

  const generated = await images.generateImages(prompt);
  if (generated.images.length !== subjects.length) {
    throw new Error(
      `ImageProvider returned ${generated.images.length} images; expected ${subjects.length}.`,
    );
  }

  const files = [];
  for (let i = 0; i < subjects.length; i += 1) {
    const subject = subjects[i]!;
    const image = generated.images[i]!;
    const fileName = `${slugifyFileName(subject)}.png`;
    const bytes = await resolveImageBytes(image.location);
    files.push({
      subject,
      fileName,
      bytes,
      sourceLocation: image.location,
    });
  }

  const manifest = await saveBundleArtifacts({
    outputDir: input.outputDir,
    styleGuide,
    subjects,
    prompts,
    files,
  });

  return {
    styleGuide,
    subjects,
    prompts,
    manifest,
    outputDir: input.outputDir,
  };
}
