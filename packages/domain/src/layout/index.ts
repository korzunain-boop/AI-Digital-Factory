export type { PaperSize, PaperSizeId } from './paper-size.js';
export { PAPER_A4, PAPER_US_LETTER, PAPER_SIZES, resolvePaperSize } from './paper-size.js';

export type { PosterTemplate, PosterTitleStyle } from './poster-template.js';
export { ETSY_CLASSIC_POSTER_TEMPLATE } from './poster-template.js';

export type {
  Rect,
  PosterLayoutGeometry,
  ComputePosterLayoutInput,
  PreviewGridGeometry,
} from './poster-layout.js';
export { computePosterLayout, computePreviewGrid } from './poster-layout.js';

export type { LayoutEngine, LayoutPosterInput } from './layout-engine.js';
