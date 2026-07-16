#!/usr/bin/env node
/**
 * Product Sprint 3 CLI — turn an illustration bundle into printable posters.
 *
 *   npm run generate-posters -- output/ocean
 *   npm run generate-posters -- output/ocean --paper US_LETTER
 *
 * Deterministic LayoutEngine + PosterTemplate. No AI layout. No PDF/ZIP.
 */
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolvePaperSize, type PaperSizeId } from '@ai-product-factory/domain';
import { SharpLayoutEngine } from '@ai-product-factory/infrastructure';

import { generatePostersFromBundle } from '../bundle/generate-posters.js';

function printUsage(): void {
  console.error(`Usage:
  npm run generate-posters -- <bundle-dir> [--paper A4|US_LETTER]

Examples:
  npm run generate-posters -- output/ocean
  npm run generate-posters -- output/nursery-animals --paper US_LETTER
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

  const paper = resolvePaperSize(paperId);
  const layout = new SharpLayoutEngine();

  console.log(`Bundle: ${bundleDir}`);
  console.log(`Paper: ${paper.label} (${paper.widthPx}×${paper.heightPx} @ ${paper.dpi} DPI)`);
  console.log('LayoutEngine: SharpLayoutEngine (deterministic template)');

  const result = await generatePostersFromBundle({
    bundleDir,
    layout,
    paper,
  });

  console.log(`Posters: ${result.posterFiles.length}`);
  console.log(`Saved: ${result.postersDir}`);
  for (const file of result.posterFiles.slice(0, 5)) {
    console.log(`  - ${file}`);
  }
  if (result.posterFiles.length > 5) {
    console.log(`  - … and ${result.posterFiles.length - 5} more`);
  }
  console.log(`  - ${result.previewFile}`);
}

main(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
