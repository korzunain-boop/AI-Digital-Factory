import { readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

import type {
  CreativeDirector,
  PaperSizeId,
  ProductMetadata,
  StyleGuide,
} from '@ai-product-factory/domain';
import { parseStyleGuide, resolvePaperSize } from '@ai-product-factory/domain';

import type { BundleManifest } from './save-bundle.js';

export interface PosterListItem {
  readonly title: string;
  readonly file: string;
}

export interface GenerateMetadataResult {
  readonly metadata: ProductMetadata;
  readonly metadataFile: string;
  readonly styleGuide: StyleGuide;
  readonly posters: readonly PosterListItem[];
}

/**
 * ProductMetadataGenerator — commercial listing metadata for a finished bundle.
 *
 * Inputs: Bundle + Style Guide + Poster list.
 * Creative copy via {@link CreativeDirector} only (LLM stays behind the director).
 * Writes marketplace-agnostic `metadata.json` — no publishing.
 */
export class ProductMetadataGenerator {
  constructor(private readonly director: CreativeDirector) {}

  async generateFromBundleDir(
    bundleDir: string,
    options?: {
      readonly paperId?: PaperSizeId;
      readonly metadataFileName?: string;
    },
  ): Promise<GenerateMetadataResult> {
    const manifest = JSON.parse(
      await readFile(join(bundleDir, 'bundle.json'), 'utf8'),
    ) as BundleManifest;
    const styleGuideRaw = JSON.parse(
      await readFile(join(bundleDir, 'style-guide.json'), 'utf8'),
    ) as unknown;
    const styleGuide = parseStyleGuide(styleGuideRaw, manifest.theme);
    const posters = await resolvePosterList(bundleDir, manifest, options?.paperId);
    const subjects = manifest.illustrations.map((item) => item.subject);

    const metadata = await this.director.createProductMetadata({
      theme: manifest.theme,
      styleGuide,
      posters,
      subjects,
    });

    const metadataFileName = options?.metadataFileName ?? 'metadata.json';
    const metadataFile = join(bundleDir, metadataFileName);
    await writeFile(metadataFile, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');

    return { metadata, metadataFile, styleGuide, posters };
  }
}

/**
 * Prefer posters under posters/<paper>/; fall back to illustration subjects as titles.
 */
async function resolvePosterList(
  bundleDir: string,
  manifest: BundleManifest,
  paperId?: PaperSizeId,
): Promise<PosterListItem[]> {
  const paper = resolvePaperSize(paperId ?? 'A4');
  const postersDir = join(bundleDir, 'posters', paper.id.toLowerCase());

  try {
    const entries = await readdir(postersDir);
    const posterFiles = entries
      .filter((name) => name.endsWith('-poster.png'))
      .sort((a, b) => a.localeCompare(b));

    if (posterFiles.length > 0) {
      const byStem = new Map(
        manifest.illustrations.map((item) => [basename(item.file, '.png'), item.subject]),
      );
      return posterFiles.map((file) => {
        const stem = file.replace(/-poster\.png$/i, '');
        const title = byStem.get(stem) ?? humanizeStem(stem);
        return { title, file };
      });
    }
  } catch {
    // posters/ may not exist yet — use bundle illustrations
  }

  return manifest.illustrations.map((item) => ({
    title: item.subject,
    file: item.file,
  }));
}

function humanizeStem(stem: string): string {
  return stem
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
