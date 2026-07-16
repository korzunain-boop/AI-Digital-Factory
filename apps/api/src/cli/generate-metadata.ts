#!/usr/bin/env node
/**
 * Product Sprint 4 CLI — commercial metadata for a digital product bundle.
 *
 *   npm run generate-metadata -- output/ocean
 *   npm run generate-metadata -- output/ocean --paper US_LETTER
 *
 * CreativeDirector only (LLM behind LLMCreativeDirector). Writes metadata.json.
 * No publishing. No Etsy API. No Dashboard.
 */
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { FakeLLMProvider, type PaperSizeId } from '@ai-product-factory/domain';
import { LLMCreativeDirector } from '@ai-product-factory/infrastructure';

import { ProductMetadataGenerator } from '../bundle/generate-metadata.js';

function printUsage(): void {
  console.error(`Usage:
  npm run generate-metadata -- <bundle-dir> [--paper A4|US_LETTER]

Examples:
  npm run generate-metadata -- output/ocean
  npm run generate-metadata -- output/nursery-animals --paper US_LETTER
`);
}

function parseArgs(argv: string[]): { bundleDir: string; paperId: PaperSizeId } {
  let paperId: PaperSizeId = 'A4';
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]!;
    if (arg === '--paper') {
      const value = argv[i + 1];
      i += 1;
      if (value === 'A4' || value === 'US_LETTER') {
        paperId = value;
      } else {
        throw new Error(`Invalid --paper value "${value ?? ''}". Use A4 or US_LETTER.`);
      }
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      return { bundleDir: '', paperId };
    }
    positional.push(arg);
  }
  return { bundleDir: positional.join(' ').trim(), paperId };
}

function resolveMonorepoRoot(): string {
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 8; i += 1) {
    if (existsSync(resolve(dir, 'apps')) && existsSync(resolve(dir, 'packages'))) {
      return dir;
    }
    dir = resolve(dir, '..');
  }
  return process.cwd();
}

async function main(argv: string[]): Promise<void> {
  const { bundleDir: rawDir, paperId } = parseArgs(argv);
  if (!rawDir) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const root = resolveMonorepoRoot();
  const bundleDir = resolve(rawDir.startsWith('/') ? rawDir : resolve(root, rawDir));
  if (!existsSync(resolve(bundleDir, 'bundle.json'))) {
    console.error(`bundle.json not found in ${bundleDir}`);
    process.exitCode = 1;
    return;
  }

  const director = new LLMCreativeDirector(new FakeLLMProvider());
  const generator = new ProductMetadataGenerator(director);

  console.log(`Bundle: ${bundleDir}`);
  console.log(`Poster paper preference: ${paperId}`);
  console.log('CreativeDirector: LLMCreativeDirector (FakeLLMProvider)');
  console.log('Generating commercial metadata…');

  const result = await generator.generateFromBundleDir(bundleDir, { paperId });

  console.log(`Posters considered: ${result.posters.length}`);
  console.log(`Title: ${result.metadata.title}`);
  console.log(`Tags: ${result.metadata.tags.length}`);
  console.log(`Saved: ${result.metadataFile}`);
}

main(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
