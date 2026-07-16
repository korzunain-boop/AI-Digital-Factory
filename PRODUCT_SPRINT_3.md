# Product Sprint 3 — Deterministic Poster Layout

> Product sprint report. Architecture docs remain frozen.  
> CreativeDirector, ImageProvider, PromptBuilder, and GeneratorEngine were **not** redesigned.

## Goal

Transform generated illustrations into printable Etsy-ready posters using a **deterministic** LayoutEngine and reusable **PosterTemplate**.

No AI layout. No PDF. No ZIP. No Marketplace. No Dashboard.

## Architecture

```
Illustration PNG + title + Style Guide
        ↓
PosterTemplate (reusable layout knobs)
        ↓
computePosterLayout (pure Domain geometry)
        ↓
LayoutEngine / SharpLayoutEngine (Infrastructure)
        ↓
poster PNG + preview.png catalog grid
```

## Implemented

1. **PosterTemplate** — background, 60% illustration coverage, margins, title typography (rounded sans-serif via SVG)
2. **Paper sizes** — A4 and US Letter @ 300 DPI
3. **LayoutEngine** port + **SharpLayoutEngine**
4. **generatePostersFromBundle** — builds posters for every illustration in a bundle
5. **preview.png** — clean grid of all posters (no room mockup)
6. **CLI:** `npm run generate-posters -- output/ocean [--paper A4|US_LETTER]`

## Files

| Path                                                        | Purpose                       |
| ----------------------------------------------------------- | ----------------------------- |
| `packages/domain/src/layout/poster-template.ts`             | PosterTemplate + ETSY_CLASSIC |
| `packages/domain/src/layout/paper-size.ts`                  | A4 / US Letter                |
| `packages/domain/src/layout/poster-layout.ts`               | Pure geometry                 |
| `packages/domain/src/layout/layout-engine.ts`               | LayoutEngine port             |
| `packages/infrastructure/src/layout/sharp-layout-engine.ts` | Sharp renderer                |
| `apps/api/src/bundle/generate-posters.ts`                   | Batch from bundle dir         |
| `apps/api/src/cli/generate-posters.ts`                      | CLI                           |
| `tests/api/poster-layout.test.ts`                           | Unit tests                    |
| `PRODUCT_SPRINT_3.md`                                       | This report                   |

## Tests

- Template coverage ≈ 60%, centered illustration, title below
- A4 vs US Letter canvases
- Preview grid cell count
- SharpLayoutEngine PNG output
- generatePostersFromBundle with Fake LayoutEngine

Run: `npm test`

## Explicit non-goals

AI layout, PDF, ZIP, room mockups, Marketplace, Dashboard, Assembler redesign.

## Self-review

### Why AI is not used for layout

Printable poster layout is a **constrained craft problem** (margins, coverage, type hierarchy, paper sizes). Deterministic templates are cheaper, reproducible for Etsy listings, and easy to QA. AI adds variance and cost without improving sellability of a fixed pack format. Creative variance stays in illustrations (CreativeDirector + ImageProvider); layout stays stable.

### How templates can evolve

- Add new `PosterTemplate` objects (e.g. `etsy-minimal-v2`, seasonal frames) without changing SharpLayoutEngine.
- Adjust coverage, margins, or title ratios on the template only.
- Add paper sizes via `PaperSize` registry.
- Swap `SharpLayoutEngine` for another renderer implementing `LayoutEngine` — Bundle/poster batch code stays the same.
