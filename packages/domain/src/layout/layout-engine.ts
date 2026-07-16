import type { StyleGuide } from '../creative/style-guide.js';
import type { PaperSize } from './paper-size.js';
import type { PosterTemplate } from './poster-template.js';

/**
 * Input for rendering one printable poster.
 */
export interface LayoutPosterInput {
  readonly illustrationPng: Buffer;
  readonly title: string;
  readonly styleGuide: StyleGuide;
  readonly paper: PaperSize;
  readonly template: PosterTemplate;
}

/**
 * LayoutEngine — deterministic poster composition (no AI).
 *
 * Responsibilities:
 * - Load one illustration
 * - Apply a reusable PosterTemplate
 * - Output PNG poster bytes
 * - Build a catalog preview grid from many posters
 */
export interface LayoutEngine {
  renderPoster(input: LayoutPosterInput): Promise<Buffer>;

  /**
   * Clean catalog grid of poster PNGs (no room mockup).
   */
  renderPreview(input: {
    readonly posterPngs: readonly Buffer[];
    readonly backgroundColor?: string;
  }): Promise<Buffer>;
}
