# Product Sprint 1 — Illustration Collection Bundle

> Product sprint report (not an architecture change).  
> `PROJECT.md`, `DECISIONS.md`, and `SYSTEM.md` remain frozen and unchanged.  
> Previous engineering milestones (M1–M10) were not modified.

## Goal

Automatically generate a complete illustration collection for one bundle: Style Guide → subject list → prompts → ImageProvider → PNG + JSON artifacts.

No layout, PDF, ZIP, preview, marketplace, QA, or dashboard.

## Implemented

1. **Style Guide** (`generateStyleGuide`) — palette, illustration style, composition, lighting, mood, negative constraints; generated once and reused.
2. **Illustration list** — default **24** subjects (e.g. Nursery Animals: Elephant, Lion, Fox, …).
3. **Prompt composer** — one prompt per subject; shared Style Guide; subject is the only variable.
4. **ImageProvider** — existing port via composition root (`FakeImageProvider` / `OpenAIImageProvider`).
5. **Disk output** under `output/<theme-slug>/`:
   - `elephant.png`, `lion.png`, …
   - `style-guide.json`
   - `prompts.json`
   - `bundle.json`
6. **CLI:** `npm run generate-bundle -- "Nursery Animals"`

## Files Added

| Path                                       | Purpose                           |
| ------------------------------------------ | --------------------------------- |
| `apps/api/src/bundle/style-guide.ts`       | Style Guide model + generator     |
| `apps/api/src/bundle/illustration-list.ts` | Subject list (default 24)         |
| `apps/api/src/bundle/prompt-composer.ts`   | Style Guide + subject → prompt    |
| `apps/api/src/bundle/save-bundle.ts`       | PNG resolve + JSON/PNG writer     |
| `apps/api/src/bundle/bundle-generator.ts`  | Orchestrator                      |
| `apps/api/src/bundle/index.ts`             | Barrel exports                    |
| `apps/api/src/cli/generate-bundle.ts`      | CLI                               |
| `tests/api/bundle-generator.test.ts`       | Unit tests (mocked ImageProvider) |
| `PRODUCT_SPRINT_1.md`                      | This report                       |

## Tests

- Style Guide completeness + determinism
- Nursery Animals list (24; Elephant…Giraffe…)
- Prompt reuse of Style Guide; subject-only delta
- `generateIllustrationBundle` with `FakeImageProvider` — one provider call; writes PNGs + JSON
- `resolveImageBytes` for `memory://` and data URLs

Run: `npm test`

## Explicit non-goals (not implemented)

Poster layout, PDF, ZIP, preview, Marketplace, QA, Dashboard, Assembler.

## Self-review

### How visual consistency is maintained

- One **Style Guide** is generated per theme and locked for the whole run.
- Every prompt embeds the same palette, illustration style, composition, lighting, mood, and negative constraints.
- Only the **subject** string changes between prompts.
- ImageProvider receives a single batch `ImageGenerationPrompt` with shared `style` / `negativePrompt` fields.

### What remains before commercial-ready posters

1. **Assembler** — layout multiple illustrations onto poster templates.
2. **PDF / ZIP packaging** — sellable ProductPackage export.
3. **Previews** — marketplace-ready cover/thumbnail images.
4. **QA** — validate pack completeness, resolution, style drift.
5. **Durable Storage** — persist beyond ephemeral OpenAI URLs / placeholders.
6. **Commercial Validation** — list and measure sell-through (business gate in `PROJECT.md`).

### Technical notes

- Fake provider writes a 1×1 placeholder PNG for `memory://` locations (offline/tests).
- Live OpenAI packs of 24 images are slow/costly; use `IMAGE_PROVIDER=openai` only when intended.
- ClipartGeneratorStrategy / DefaultPromptBuilder / PipelineExecutor were **not** changed.
