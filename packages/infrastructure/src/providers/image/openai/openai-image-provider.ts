import type {
  GeneratedImage,
  GeneratedImages,
  ImageGenerationPrompt,
} from '@ai-product-factory/domain';

import type { HttpClient } from '../../../http/http-client.js';
import type { ImageProviderConfig } from '../image-provider-config.js';
import { HttpImageProviderBase } from '../http-image-provider-base.js';
import { InvalidResponseError } from '../provider-errors.js';

/**
 * OpenAI Images demonstration provider (Milestone M9).
 *
 * All OpenAI-specific URL paths, payloads, and response parsing live HERE only.
 * Uses {@link HttpImageProviderBase} for HTTP/auth/retry/error translation.
 *
 * ImageProvider abstraction remains unchanged for Clipart / Engine / Pipeline.
 */
export class OpenAIImageProvider extends HttpImageProviderBase {
  constructor(config: ImageProviderConfig, http: HttpClient) {
    super(config, http);
  }

  /**
   * Generate images by calling OpenAI Images API once per prompt string.
   */
  protected async doGenerateImages(prompt: ImageGenerationPrompt): Promise<GeneratedImages> {
    const images: GeneratedImage[] = [];

    for (let i = 0; i < prompt.prompts.length; i += 1) {
      const text = prompt.prompts[i] ?? '';
      const size = mapSize(prompt.width, prompt.height);
      const payload = {
        model: this.config.model,
        prompt: text,
        n: 1,
        size,
      };

      const json = await this.executeJsonRequest({
        url: `${this.config.baseUrl}/images/generations`,
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const item = parseOpenAIImageItem(json, prompt, i + 1, this.config.model);
      images.push(item);
    }

    return { images };
  }
}

/**
 * Map Domain width/height to OpenAI Images size enum.
 */
function mapSize(width: number, height: number): '1024x1024' | '512x512' | '256x256' {
  const max = Math.max(width, height);
  if (max >= 1024) {
    return '1024x1024';
  }
  if (max >= 512) {
    return '512x512';
  }
  return '256x256';
}

/**
 * Parse one OpenAI images.generations JSON response into GeneratedImage.
 */
function parseOpenAIImageItem(
  json: unknown,
  prompt: ImageGenerationPrompt,
  index: number,
  model: string,
): GeneratedImage {
  if (!json || typeof json !== 'object') {
    throw new InvalidResponseError('OpenAI response is not an object');
  }

  const data = (json as { data?: unknown }).data;
  if (!Array.isArray(data) || data.length === 0) {
    throw new InvalidResponseError('OpenAI response missing data[]');
  }

  const first = data[0];
  if (!first || typeof first !== 'object') {
    throw new InvalidResponseError('OpenAI data[0] is invalid');
  }

  const record = first as { url?: unknown; b64_json?: unknown };
  const padded = String(index).padStart(2, '0');
  const slugTheme = slugify(prompt.theme);
  const slugStyle = slugify(prompt.style);
  const fileBase = `${slugTheme}-${slugStyle}-${padded}`;

  let location: string;
  if (typeof record.url === 'string' && record.url.length > 0) {
    location = record.url;
  } else if (typeof record.b64_json === 'string' && record.b64_json.length > 0) {
    location = `data:image/png;base64,${record.b64_json}`;
  } else {
    throw new InvalidResponseError('OpenAI data[0] missing url and b64_json');
  }

  return {
    assetId: `openai-asset-${prompt.requestId}-${padded}`,
    name: `${fileBase}.png`,
    mediaType: 'image/png',
    location,
    metadata: {
      index,
      theme: prompt.theme,
      style: prompt.style,
      width: prompt.width,
      height: prompt.height,
      format: 'png',
      purpose: prompt.purpose,
      provider: 'openai',
      model,
      promptText: prompt.prompts[index - 1] ?? '',
    },
  };
}

function slugify(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'item'
  );
}
