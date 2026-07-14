import {
  ClipartGeneratorStrategy,
  DefaultGeneratorEngine,
  DefaultPromptBuilder,
  FakeImageProvider,
  type GeneratorEngine,
  type ImageProvider,
} from '@ai-product-factory/domain';
import {
  createImageProviderConfig,
  FetchHttpClient,
  OpenAIImageProvider,
  type HttpClient,
} from '@ai-product-factory/infrastructure';

import { type RuntimeConfig } from '../config/runtime-config.js';

/**
 * Optional overrides for tests (inject mock HttpClient — never used in production CLI path).
 */
export interface CompositionDeps {
  readonly http?: HttpClient;
}

export interface AppComposition {
  readonly config: RuntimeConfig;
  readonly engine: GeneratorEngine;
  readonly imageProvider: ImageProvider;
}

/**
 * Composition root — wires Domain Engine + Clipart + PromptBuilder + ImageProvider.
 *
 * Switch Fake ↔ OpenAI via RuntimeConfig only (IMAGE_PROVIDER env). No Domain changes.
 */
export function createComposition(
  config: RuntimeConfig,
  deps: CompositionDeps = {},
): AppComposition {
  const imageProvider = createImageProviderFromConfig(config, deps);
  const strategy = new ClipartGeneratorStrategy(imageProvider, new DefaultPromptBuilder());
  const engine = new DefaultGeneratorEngine([strategy]);

  return {
    config,
    engine,
    imageProvider,
  };
}

/**
 * Build ImageProvider from runtime config (config-only switch).
 */
export function createImageProviderFromConfig(
  config: RuntimeConfig,
  deps: CompositionDeps = {},
): ImageProvider {
  if (config.imageProvider === 'fake') {
    return new FakeImageProvider();
  }

  const openai = config.openai;
  if (!openai) {
    throw new Error('RuntimeConfig.openai is required when imageProvider is "openai"');
  }

  const http = deps.http ?? new FetchHttpClient();
  return new OpenAIImageProvider(
    createImageProviderConfig({
      apiKey: openai.apiKey,
      baseUrl: openai.baseUrl,
      model: openai.model,
      timeoutMs: openai.timeoutMs,
      retries: openai.retries,
    }),
    http,
  );
}

/**
 * API shell (unchanged shape for existing start script).
 */
export type AppShell = {
  name: string;
  composition: AppComposition;
};

export function createApp(config: RuntimeConfig, deps?: CompositionDeps): AppShell {
  return {
    name: 'ai-product-factory-api',
    composition: createComposition(config, deps),
  };
}
