import type { PaperSize } from './paper-size.js';
import type { PosterTemplate } from './poster-template.js';

export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Fully resolved layout geometry for one poster page.
 * Produced deterministically from PaperSize + PosterTemplate.
 */
export interface PosterLayoutGeometry {
  readonly canvas: { readonly width: number; readonly height: number };
  readonly backgroundColor: string;
  readonly illustrationBox: Rect;
  readonly titleBox: Rect;
  readonly titleFontSizePx: number;
  readonly titleColor: string;
  readonly titleFontFamily: string;
  readonly titleFontWeight: number;
}

export interface ComputePosterLayoutInput {
  readonly paper: PaperSize;
  readonly template: PosterTemplate;
  /** Optional title color override (e.g. from Style Guide palette). */
  readonly titleColor?: string;
}

/**
 * Pure layout math — no I/O, no AI, no image libraries.
 */
export function computePosterLayout(input: ComputePosterLayoutInput): PosterLayoutGeometry {
  const { paper, template } = input;
  const { widthPx: W, heightPx: H } = paper;
  const shorter = Math.min(W, H);

  const margin = shorter * template.marginRatio;
  const maxIlluSide = shorter * template.illustrationCoverage;

  const illustrationBox: Rect = {
    width: maxIlluSide,
    height: maxIlluSide,
    x: (W - maxIlluSide) / 2,
    y: H * template.illustrationCenterYRatio - maxIlluSide / 2,
  };

  // Keep illustration inside margins
  const clampedY = Math.max(
    margin,
    Math.min(illustrationBox.y, H - margin - illustrationBox.height),
  );
  const illu: Rect = { ...illustrationBox, y: clampedY };

  const titleFontSizePx = Math.round(H * template.title.fontSizeRatio);
  const titleWidth = W * template.title.maxWidthRatio;
  const titleHeight = titleFontSizePx * 1.4;
  const gap = H * template.title.gapBelowIllustrationRatio;
  const titleY = illu.y + illu.height + gap;

  const titleBox: Rect = {
    x: (W - titleWidth) / 2,
    y: Math.min(titleY, H - margin - titleHeight),
    width: titleWidth,
    height: titleHeight,
  };

  return {
    canvas: { width: W, height: H },
    backgroundColor: template.backgroundColor,
    illustrationBox: illu,
    titleBox,
    titleFontSizePx,
    titleColor: input.titleColor ?? template.title.color,
    titleFontFamily: template.title.fontFamily,
    titleFontWeight: template.title.fontWeight,
  };
}

/**
 * Preview grid geometry for N poster thumbnails on a catalog sheet.
 */
export interface PreviewGridGeometry {
  readonly canvas: { readonly width: number; readonly height: number };
  readonly backgroundColor: string;
  readonly cells: readonly Rect[];
  readonly columns: number;
  readonly rows: number;
}

export function computePreviewGrid(input: {
  readonly count: number;
  readonly cellWidth: number;
  readonly cellHeight: number;
  readonly gap: number;
  readonly padding: number;
  readonly backgroundColor: string;
  readonly columns?: number;
}): PreviewGridGeometry {
  if (input.count < 1) {
    throw new Error('Preview grid requires at least one poster');
  }
  const columns = input.columns ?? Math.ceil(Math.sqrt(input.count));
  const rows = Math.ceil(input.count / columns);
  const { cellWidth, cellHeight, gap, padding } = input;

  const canvasWidth = padding * 2 + columns * cellWidth + (columns - 1) * gap;
  const canvasHeight = padding * 2 + rows * cellHeight + (rows - 1) * gap;

  const cells: Rect[] = [];
  for (let i = 0; i < input.count; i += 1) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    cells.push({
      x: padding + col * (cellWidth + gap),
      y: padding + row * (cellHeight + gap),
      width: cellWidth,
      height: cellHeight,
    });
  }

  return {
    canvas: { width: canvasWidth, height: canvasHeight },
    backgroundColor: input.backgroundColor,
    cells,
    columns,
    rows,
  };
}
