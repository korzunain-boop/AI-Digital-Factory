import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { ResearchResult } from './types.js';

const toolRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function defaultOutputDir(): string {
  return join(toolRoot, 'output');
}

/**
 * Persist research JSON under tools/etsy-research/output/.
 * Returns the written absolute path.
 */
export async function writeResearchOutput(
  result: ResearchResult,
  outputDir: string = defaultOutputDir(),
): Promise<string> {
  await mkdir(outputDir, { recursive: true });

  const stamp = result.queriedAt.replace(/[:.]/g, '-');
  const safeSlug = slugify(result.input).slice(0, 48) || 'query';
  const filename = `${result.source}-${safeSlug}-${stamp}.json`;
  const path = join(outputDir, filename);

  await writeFile(path, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  return path;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
