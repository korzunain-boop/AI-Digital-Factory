import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { StyleGuide } from './style-guide.js';

/** Minimal valid 1×1 PNG (placeholder when FakeImageProvider returns memory://). */
export const PLACEHOLDER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

export interface BundleIllustrationRecord {
  readonly subject: string;
  readonly file: string;
  readonly prompt: string;
  readonly sourceLocation: string;
}

export interface BundleManifest {
  readonly theme: string;
  readonly count: number;
  readonly createdAt: string;
  readonly styleGuideFile: 'style-guide.json';
  readonly promptsFile: 'prompts.json';
  readonly illustrations: readonly BundleIllustrationRecord[];
}

export interface PromptsFile {
  readonly theme: string;
  readonly styleGuideTheme: string;
  readonly prompts: readonly { readonly subject: string; readonly prompt: string }[];
}

/**
 * Persist style-guide.json, prompts.json, bundle.json, and PNG files under outputDir.
 */
export async function saveBundleArtifacts(input: {
  readonly outputDir: string;
  readonly styleGuide: StyleGuide;
  readonly subjects: readonly string[];
  readonly prompts: readonly string[];
  readonly files: readonly {
    readonly subject: string;
    readonly fileName: string;
    readonly bytes: Buffer;
    readonly sourceLocation: string;
  }[];
}): Promise<BundleManifest> {
  await mkdir(input.outputDir, { recursive: true });

  await writeFile(
    join(input.outputDir, 'style-guide.json'),
    `${JSON.stringify(input.styleGuide, null, 2)}\n`,
    'utf8',
  );

  const promptsFile: PromptsFile = {
    theme: input.styleGuide.theme,
    styleGuideTheme: input.styleGuide.theme,
    prompts: input.subjects.map((subject, index) => ({
      subject,
      prompt: input.prompts[index] ?? '',
    })),
  };
  await writeFile(
    join(input.outputDir, 'prompts.json'),
    `${JSON.stringify(promptsFile, null, 2)}\n`,
    'utf8',
  );

  for (const file of input.files) {
    await writeFile(join(input.outputDir, file.fileName), file.bytes);
  }

  const manifest: BundleManifest = {
    theme: input.styleGuide.theme,
    count: input.files.length,
    createdAt: new Date().toISOString(),
    styleGuideFile: 'style-guide.json',
    promptsFile: 'prompts.json',
    illustrations: input.files.map((file, index) => ({
      subject: file.subject,
      file: file.fileName,
      prompt: input.prompts[index] ?? '',
      sourceLocation: file.sourceLocation,
    })),
  };

  await writeFile(
    join(input.outputDir, 'bundle.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );

  return manifest;
}

/**
 * Resolve an ImageProvider location into PNG bytes.
 */
export async function resolveImageBytes(
  location: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Buffer> {
  if (location.startsWith('memory://')) {
    return PLACEHOLDER_PNG;
  }

  if (location.startsWith('data:image/')) {
    const comma = location.indexOf(',');
    if (comma < 0) {
      throw new Error('Invalid data URL image location');
    }
    const meta = location.slice(0, comma);
    const data = location.slice(comma + 1);
    if (meta.includes(';base64')) {
      return Buffer.from(data, 'base64');
    }
    return Buffer.from(decodeURIComponent(data), 'utf8');
  }

  if (location.startsWith('http://') || location.startsWith('https://')) {
    const response = await fetchImpl(location);
    if (!response.ok) {
      throw new Error(`Failed to download image (${response.status}): ${location}`);
    }
    return Buffer.from(await response.arrayBuffer());
  }

  throw new Error(`Unsupported image location: ${location}`);
}

export function slugifyFileName(subject: string): string {
  return (
    subject
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'illustration'
  );
}
