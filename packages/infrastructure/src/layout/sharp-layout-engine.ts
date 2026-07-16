import sharp from 'sharp';

import type {
  LayoutEngine,
  LayoutPosterInput,
  PosterLayoutGeometry,
  StyleGuide,
} from '@ai-product-factory/domain';
import { computePosterLayout, computePreviewGrid } from '@ai-product-factory/domain';

/**
 * Deterministic LayoutEngine using sharp + SVG title overlay.
 * All geometry comes from PosterTemplate via computePosterLayout — nothing hardcoded here.
 */
export class SharpLayoutEngine implements LayoutEngine {
  async renderPoster(input: LayoutPosterInput): Promise<Buffer> {
    const titleColor = pickTitleColor(input.styleGuide, input.template.title.color);
    const layout = computePosterLayout({
      paper: input.paper,
      template: input.template,
      titleColor,
    });

    const fitted = await fitIllustration(input.illustrationPng, layout.illustrationBox);

    const titleSvg = buildTitleSvg(input.title, layout);

    return sharp({
      create: {
        width: layout.canvas.width,
        height: layout.canvas.height,
        channels: 3,
        background: layout.backgroundColor,
      },
    })
      .composite([
        {
          input: fitted,
          left: Math.round(layout.illustrationBox.x),
          top: Math.round(layout.illustrationBox.y),
        },
        {
          input: Buffer.from(titleSvg),
          left: Math.round(layout.titleBox.x),
          top: Math.round(layout.titleBox.y),
        },
      ])
      .png()
      .toBuffer();
  }

  async renderPreview(input: {
    readonly posterPngs: readonly Buffer[];
    readonly backgroundColor?: string;
  }): Promise<Buffer> {
    const posters = input.posterPngs;
    if (posters.length === 0) {
      throw new Error('renderPreview requires at least one poster PNG');
    }

    const cellWidth = 400;
    const cellHeight = 560;
    const gap = 24;
    const padding = 40;
    const backgroundColor = input.backgroundColor ?? '#FAF6F1';

    const grid = computePreviewGrid({
      count: posters.length,
      cellWidth,
      cellHeight,
      gap,
      padding,
      backgroundColor,
      columns: posters.length <= 4 ? 2 : posters.length <= 9 ? 3 : 4,
    });

    const composites: sharp.OverlayOptions[] = [];
    for (let i = 0; i < posters.length; i += 1) {
      const cell = grid.cells[i]!;
      const thumb = await sharp(posters[i]!)
        .resize(Math.round(cell.width), Math.round(cell.height), {
          fit: 'contain',
          background: backgroundColor,
        })
        .png()
        .toBuffer();
      composites.push({
        input: thumb,
        left: Math.round(cell.x),
        top: Math.round(cell.y),
      });
    }

    return sharp({
      create: {
        width: Math.round(grid.canvas.width),
        height: Math.round(grid.canvas.height),
        channels: 3,
        background: grid.backgroundColor,
      },
    })
      .composite(composites)
      .png()
      .toBuffer();
  }
}

async function fitIllustration(
  png: Buffer,
  box: { width: number; height: number },
): Promise<Buffer> {
  return sharp(png)
    .resize(Math.round(box.width), Math.round(box.height), {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

function buildTitleSvg(title: string, layout: PosterLayoutGeometry): string {
  const { width, height } = layout.titleBox;
  const fontSize = layout.titleFontSizePx;
  const escaped = escapeXml(title);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${Math.round(width)}" height="${Math.round(height)}" xmlns="http://www.w3.org/2000/svg">
  <text
    x="50%"
    y="50%"
    dominant-baseline="middle"
    text-anchor="middle"
    font-family='${layout.titleFontFamily.replace(/'/g, '')}'
    font-size="${fontSize}"
    font-weight="${layout.titleFontWeight}"
    fill="${layout.titleColor}"
  >${escaped}</text>
</svg>`;
}

function pickTitleColor(styleGuide: StyleGuide, fallback: string): string {
  const fromPalette = styleGuide.palette.find((c) => /^#[0-9A-Fa-f]{6}$/.test(c));
  // Prefer a darker-ish palette entry when available; else template default.
  if (!fromPalette) {
    return fallback;
  }
  const last = styleGuide.palette[styleGuide.palette.length - 1];
  if (typeof last === 'string' && /^#[0-9A-Fa-f]{6}$/.test(last)) {
    return last;
  }
  return fromPalette;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
