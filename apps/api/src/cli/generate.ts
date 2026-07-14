#!/usr/bin/env node
/**
 * CLI — first real generation path (Milestone M10).
 *
 *   npm run generate
 *
 * Env:
 *   IMAGE_PROVIDER=fake|openai
 *   OPENAI_API_KEY=...
 *   OPENAI_IMAGE_MODEL=dall-e-3
 *
 * No dashboard. No REST. Prints image URLs / locations from GenerationResult.
 */
import {
  CLIPART_STRATEGY_KEY,
  toClipartTemplateParams,
  type GenerationRequest,
} from '@ai-product-factory/domain';

import { createComposition } from '../bootstrap/composition-root.js';
import { loadDotEnvIfPresent } from '../config/load-dotenv.js';
import { ConfigurationError, loadRuntimeConfig } from '../config/runtime-config.js';

function sampleGenerationRequest(): GenerationRequest {
  return {
    id: `cli-${Date.now()}`,
    strategyKey: CLIPART_STRATEGY_KEY,
    researchBriefId: 'brief-cli-manual',
    template: toClipartTemplateParams({
      theme: 'cat',
      style: 'flat vector',
      assetCount: 1,
    }),
    limits: { maxAssets: 1 },
    createdAt: new Date().toISOString(),
  };
}

async function main(): Promise<void> {
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

  console.log(`Image provider: ${config.imageProvider}`);
  if (config.imageProvider === 'openai') {
    console.log(`Model: ${config.openai?.model}`);
  }

  const { engine } = createComposition(config);
  const request = sampleGenerationRequest();

  console.log(`Running GeneratorEngine (${request.strategyKey})…`);
  const result = await engine.generate(request);

  if (!result.ok) {
    console.error('Generation failed:');
    for (const err of result.errors) {
      console.error(`  - ${err}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('Generation succeeded.');
  console.log(`assetBundleId: ${result.assetBundleId}`);

  const assets = result.assetBundle?.assets ?? [];
  if (assets.length === 0) {
    console.log('No in-memory assets on result (locations may be Storage-backed later).');
    return;
  }

  console.log(`Assets (${assets.length}):`);
  for (const asset of assets) {
    console.log(`  - ${asset.name}`);
    console.log(`    location: ${asset.location}`);
    if (asset.metadata) {
      const model = asset.metadata.model;
      const provider = asset.metadata.provider;
      if (provider !== undefined || model !== undefined) {
        console.log(`    meta: provider=${String(provider ?? '')} model=${String(model ?? '')}`);
      }
    }
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Unexpected error: ${message}`);
  process.exitCode = 1;
});
