/**
 * Reusable poster layout template — all geometric/visual knobs live here.
 * Renderers must not hardcode layout values; they read from this object.
 */
export interface PosterTitleStyle {
  /** CSS-like font family for SVG title rendering (rounded sans-serif). */
  readonly fontFamily: string;
  readonly fontWeight: number;
  /** Title color; may be overridden from Style Guide palette by the engine. */
  readonly color: string;
  /** Max title block width as a fraction of page width. */
  readonly maxWidthRatio: number;
  /** Font size as a fraction of page height. */
  readonly fontSizeRatio: number;
  /** Vertical gap below the illustration box as a fraction of page height. */
  readonly gapBelowIllustrationRatio: number;
}

export interface PosterTemplate {
  readonly id: string;
  readonly name: string;
  /** Warm off-white (or other) page background. */
  readonly backgroundColor: string;
  /**
   * Illustration occupies this fraction of the page's shorter side
   * (≈60% of the printable visual area).
   */
  readonly illustrationCoverage: number;
  /** Outer margin as a fraction of the shorter page side. */
  readonly marginRatio: number;
  /**
   * Vertical center of the illustration box as a fraction of page height
   * (0.5 = geometric center; slightly above leaves room for title).
   */
  readonly illustrationCenterYRatio: number;
  readonly title: PosterTitleStyle;
}

/**
 * Default Etsy-ready printable template (deterministic, non-AI).
 */
export const ETSY_CLASSIC_POSTER_TEMPLATE: PosterTemplate = {
  id: 'etsy-classic-v1',
  name: 'Etsy Classic',
  backgroundColor: '#FAF6F1',
  illustrationCoverage: 0.6,
  marginRatio: 0.08,
  illustrationCenterYRatio: 0.44,
  title: {
    fontFamily: '"Nunito", "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif',
    fontWeight: 700,
    color: '#3D3A36',
    maxWidthRatio: 0.78,
    fontSizeRatio: 0.038,
    gapBelowIllustrationRatio: 0.045,
  },
};
