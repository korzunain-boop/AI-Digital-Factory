#!/usr/bin/env node
/**
 * Product Sprint 2 CLI — generate a complete illustration collection.
 *
 *   npm run generate-bundle -- "Nursery Animals"
 *
 * CreativeDirector: LLMCreativeDirector(FakeLLMProvider) until a real LLM adapter exists.
 * Images via composition-root ImageProvider.
 */
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { FakeLLMProvider } from '@ai-product-factory/domain';
import { LLMCreativeDirector } from '@ai-product-factory/infrastructure';

import { generateIllustrationBundle, slugifyFileName } from '../bundle/index.js';
import { createComposition } from '../bootstrap/composition-root.js';
import { loadDotEnvIfPresent } from '../config/load-dotenv.js';
import { ConfigurationError, loadRuntimeConfig } from '../config/runtime-config.js';

function printUsage(): void {
  console.error(`Usage:
  npm run generate-bundle -- "<theme>"

Examples:
  npm run generate-bundle -- "Nursery Animals"
  npm run generate-bundle -- "Ocean"
  npm run generate-bundle -- "Dinosaurs"

Env (images — CreativeDirector uses FakeLLMProvider until OpenAI LLM exists):
  IMAGE_PROVIDER=fake|openai
  OPENAI_API_KEY=...
  OPENAI_IMAGE_MODEL=dall-e-3
`);
}

function resolveOutputRoot(): string {
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 8; i += 1) {
    if (existsSync(resolve(dir, 'apps')) && existsSync(resolve(dir, 'packages'))) {
      return resolve(dir, 'output');
    }
    dir = resolve(dir, '..');
  }
  return resolve(process.cwd(), 'output');
}

async function main(argv: string[]): Promise<void> {
  const theme = argv.join(' ').trim();
  if (!theme || theme === '--help' || theme === '-h') {
    printUsage();
    process.exitCode = theme ? 0 : 1;
    return;
  }

  loadDotEnvIfPresent();

  let config;
  try {
    config = loadRuntimeConfig();
  } catch (error) {
    if (error instanceof ConfigurationError) {
      console.error(error.message);
      process.exitCode = 1;
      return;
    }
    throw error;
  }

  const { imageProvider } = createComposition(config);
  const director = new LLMCreativeDirector(new FakeLLMProvider());
  const themeSlug = slugifyFileName(theme);
  const outputDir = resolve(resolveOutputRoot(), themeSlug);

  console.log(`Theme: ${theme}`);
  console.log(`CreativeDirector: LLMCreativeDirector (FakeLLMProvider)`);
  console.log(`Image provider: ${config.imageProvider}`);
  console.log(`Output: ${outputDir}`);
  console.log('CreativeDirector → Style Guide → subjects → prompts…');

  const result = await generateIllustrationBundle(imageProvider, director, {
    theme,
    outputDir,
  });

  console.log(`Style guide: ${result.styleGuide.illustrationStyle}`);
  console.log(`Illustrations: ${result.subjects.length}`);
  console.log(`Saved: ${result.outputDir}`);
  console.log(`  - style-guide.json`);
  console.log(`  - prompts.json`);
  console.log(`  - bundle.json`);
  for (const item of result.manifest.illustrations.slice(0, 5)) {
    console.log(`  - ${item.file} (${item.subject})`);
  }
  if (result.manifest.illustrations.length > 5) {
    console.log(`  - … and ${result.manifest.illustrations.length - 5} more PNGs`);
  }
}

main(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
