/**
 * Minimal runtime configuration for Milestone M10.
 * Values are injected from the environment — no globals, no secrets in code.
 */

export type ImageProviderKind = 'fake' | 'openai';

export interface OpenAIRuntimeConfig {
  readonly apiKey: string;
  readonly model: string;
  readonly baseUrl: string;
  readonly timeoutMs: number;
  readonly retries: number;
}

export interface RuntimeConfig {
  readonly imageProvider: ImageProviderKind;
  /** Present when imageProvider === 'openai'. */
  readonly openai?: OpenAIRuntimeConfig;
}

/**
 * User-facing configuration failure (missing API key, invalid IMAGE_PROVIDER, etc.).
 */
export class ConfigurationError extends Error {
  override readonly name = 'ConfigurationError';

  constructor(message: string) {
    super(message);
  }
}

const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_OPENAI_MODEL = 'dall-e-3';
const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_RETRIES = 1;

/**
 * Load runtime config from an env map (injectable for tests).
 *
 * Env:
 * - IMAGE_PROVIDER = fake | openai (default: fake)
 * - OPENAI_API_KEY (required when IMAGE_PROVIDER=openai)
 * - OPENAI_IMAGE_MODEL (optional; defaults to dall-e-3)
 * - OPENAI_BASE_URL (optional)
 * - OPENAI_TIMEOUT_MS / OPENAI_RETRIES (optional)
 */
export function loadRuntimeConfig(env: NodeJS.ProcessEnv = process.env): RuntimeConfig {
  const raw = (env.IMAGE_PROVIDER ?? 'fake').trim().toLowerCase();
  if (raw !== 'fake' && raw !== 'openai') {
    throw new ConfigurationError(
      `Invalid IMAGE_PROVIDER="${env.IMAGE_PROVIDER}". Use "fake" or "openai".`,
    );
  }

  if (raw === 'fake') {
    return { imageProvider: 'fake' };
  }

  const apiKey = env.OPENAI_API_KEY?.trim() ?? '';
  if (!apiKey) {
    throw new ConfigurationError(
      [
        'OPENAI_API_KEY is missing.',
        'Set OPENAI_API_KEY in your environment or .env file, then rerun with IMAGE_PROVIDER=openai.',
        'Example:',
        '  IMAGE_PROVIDER=openai OPENAI_API_KEY=sk-... OPENAI_IMAGE_MODEL=dall-e-3 npm run generate',
      ].join('\n'),
    );
  }

  const model = env.OPENAI_IMAGE_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
  const baseUrl = env.OPENAI_BASE_URL?.trim() || DEFAULT_OPENAI_BASE_URL;
  const timeoutMs = parsePositiveInt(
    env.OPENAI_TIMEOUT_MS,
    DEFAULT_TIMEOUT_MS,
    'OPENAI_TIMEOUT_MS',
  );
  const retries = parseNonNegativeInt(env.OPENAI_RETRIES, DEFAULT_RETRIES, 'OPENAI_RETRIES');

  return {
    imageProvider: 'openai',
    openai: {
      apiKey,
      model,
      baseUrl,
      timeoutMs,
      retries,
    },
  };
}

function parsePositiveInt(raw: string | undefined, fallback: number, name: string): number {
  if (raw === undefined || raw.trim() === '') {
    return fallback;
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) {
    throw new ConfigurationError(`${name} must be a positive number (got "${raw}").`);
  }
  return Math.trunc(n);
}

function parseNonNegativeInt(raw: string | undefined, fallback: number, name: string): number {
  if (raw === undefined || raw.trim() === '') {
    return fallback;
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) {
    throw new ConfigurationError(`${name} must be >= 0 (got "${raw}").`);
  }
  return Math.trunc(n);
}
