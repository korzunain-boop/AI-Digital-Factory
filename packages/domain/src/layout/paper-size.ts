/**
 * Printable paper sizes at 300 DPI (Etsy digital download printables).
 */
export type PaperSizeId = 'A4' | 'US_LETTER';

export interface PaperSize {
  readonly id: PaperSizeId;
  /** Display label. */
  readonly label: string;
  readonly widthPx: number;
  readonly heightPx: number;
  readonly dpi: number;
}

/** A4 at 300 DPI: 210×297 mm. */
export const PAPER_A4: PaperSize = {
  id: 'A4',
  label: 'A4',
  widthPx: 2480,
  heightPx: 3508,
  dpi: 300,
};

/** US Letter at 300 DPI: 8.5×11 in. */
export const PAPER_US_LETTER: PaperSize = {
  id: 'US_LETTER',
  label: 'US Letter',
  widthPx: 2550,
  heightPx: 3300,
  dpi: 300,
};

export const PAPER_SIZES: Readonly<Record<PaperSizeId, PaperSize>> = {
  A4: PAPER_A4,
  US_LETTER: PAPER_US_LETTER,
};

export function resolvePaperSize(id: PaperSizeId): PaperSize {
  return PAPER_SIZES[id];
}
