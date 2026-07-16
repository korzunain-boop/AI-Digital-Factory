import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

import type { LayoutEngine, PosterTemplate, StyleGuide } from '@ai-product-factory/domain';
import {
  ETSY_CLASSIC_POSTER_TEMPLATE,
  parseStyleGuide,
  PAPER_A4,
  resolvePaperSize,
  type PaperSize,
  type PaperSizeId,
} from '@ai-product-factory/domain';

import type { BundleManifest } from './save-bundle.js';

/**
 * Generate printable posters + catalog preview from an illustration bundle directory.
 *
 * Expects:
 *   bundleDir/bundle.json
 *   bundleDir/style-guide.json
 *   bundleDir/<illustration>.png
 *
 * Writes:
 *   bundleDir/posters/<paper-id>/<slug>-poster.png
 *   bundleDir/posters/<paper-id>/preview.png
 */
export async function generatePostersFromBundle(input: {
  readonly bundleDir: string;
  readonly layout: LayoutEngine;
  readonly paper?: PaperSize;
  readonly paperId?: PaperSizeId;
  readonly template?: PosterTemplate;
  readonly outputSubdir?: string;
}): Promise<{
  readonly postersDir: string;
  readonly posterFiles: readonly string[];
  readonly previewFile: string;
  readonly styleGuide: StyleGuide;
  readonly paper: PaperSize;
}> {
  const paper = input.paper ?? (input.paperId ? resolvePaperSize(input.paperId) : PAPER_A4);
  const template = input.template ?? ETSY_CLASSIC_POSTER_TEMPLATE;
  const postersDir = join(input.bundleDir, input.outputSubdir ?? 'posters', paper.id.toLowerCase());
  await mkdir(postersDir, { recursive: true });

  const manifest = JSON.parse(
    await readFile(join(input.bundleDir, 'bundle.json'), 'utf8'),
  ) as BundleManifest;
  const styleGuideRaw = JSON.parse(
    await readFile(join(input.bundleDir, 'style-guide.json'), 'utf8'),
  ) as unknown;
  const styleGuide = parseStyleGuide(styleGuideRaw, manifest.theme);

  const posterBuffers: Buffer[] = [];
  const posterFiles: string[] = [];

  for (const item of manifest.illustrations) {
    const illustrationPng = await readFile(join(input.bundleDir, item.file));
    const posterPng = await input.layout.renderPoster({
      illustrationPng,
      title: item.subject,
      styleGuide,
      paper,
      template,
    });

    const outName = `${basename(item.file, '.png')}-poster.png`;
    await writeFile(join(postersDir, outName), posterPng);
    posterFiles.push(outName);
    posterBuffers.push(posterPng);
  }

  const previewPng = await input.layout.renderPreview({
    posterPngs: posterBuffers,
    backgroundColor: template.backgroundColor,
  });
  const previewFile = 'preview.png';
  await writeFile(join(postersDir, previewFile), previewPng);

  return { postersDir, posterFiles, previewFile, styleGuide, paper };
}
