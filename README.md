# AI Product Factory

Source of truth (repo root):

- [`PROJECT.md`](./PROJECT.md) — product vision, MVP, roadmap, validation
- [`DECISIONS.md`](./DECISIONS.md) — architectural decision log
- [`SYSTEM.md`](./SYSTEM.md) — engineering organization
- [`MILESTONE_REPORT.md`](./MILESTONE_REPORT.md) — completed milestone log
- [`PRODUCT_SPRINT_1.md`](./PRODUCT_SPRINT_1.md) — illustration collection bundle sprint
- [`PRODUCT_SPRINT_2.md`](./PRODUCT_SPRINT_2.md) — CreativeDirector domain service
- [`PRODUCT_SPRINT_3.md`](./PRODUCT_SPRINT_3.md) — deterministic poster layout
- [`PRODUCT_SPRINT_4.md`](./PRODUCT_SPRINT_4.md) — commercial product metadata

## Project Status

| Field                          | Status                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------ |
| **Current Milestone**          | Product Sprint 4 — Commercial Product Metadata                                             |
| **Architecture Status**        | Approved; frozen (PROJECT / DECISIONS / SYSTEM unchanged)                                  |
| **Business Validation Status** | Not started (gate defined in `PROJECT.md`)                                                 |
| **Generator Status**           | Bundle + posters + metadata (`generate-bundle` / `generate-posters` / `generate-metadata`) |
| **Research Status**            | NotImplemented placeholder (tests may stub success to reach Generator)                     |
| **Publisher Status**           | NotImplemented placeholder — export not implemented yet                                    |

## Prerequisites

- Node.js 20+
- npm (bundled with Node; plain npm workspaces only)

## Setup

```bash
npm install
cp .env.example .env
```

## Scripts

| Command                     | Purpose                                    |
| --------------------------- | ------------------------------------------ |
| `npm run build`             | Build all workspaces that define `build`   |
| `npm test`                  | Build packages + run unit tests (`tsx`)    |
| `npm run generate`          | Run Clipart via GeneratorEngine (CLI)      |
| `npm run generate-bundle`   | Illustration collection (CreativeDirector) |
| `npm run generate-posters`  | Printable posters + preview from a bundle  |
| `npm run generate-metadata` | Commercial `metadata.json` for a bundle    |
| `npm run research`          | Standalone Etsy listing scrape (dev tool)  |
| `npm run research-search`   | Standalone Etsy search scrape (dev tool)   |
| `npm run lint`              | ESLint (minimal defaults)                  |
| `npm run format`            | Prettier write                             |
| `npm run format:check`      | Prettier check                             |

Generate (Fake by default — no API key):

```bash
npm run generate
```

Generate with OpenAI (real image; requires key in `.env` or env):

```bash
# .env: IMAGE_PROVIDER=openai, OPENAI_API_KEY=sk-..., OPENAI_IMAGE_MODEL=dall-e-3
IMAGE_PROVIDER=openai npm run generate
```

Illustration collection bundle (Product Sprint 1 — Fake by default):

```bash
npm run generate-bundle -- "Nursery Animals"
# writes output/nursery-animals/{…}.png + style-guide.json + prompts.json + bundle.json
```

Printable posters from a bundle (Product Sprint 3):

```bash
npm run generate-posters -- output/nursery-animals
npm run generate-posters -- output/nursery-animals --paper US_LETTER
# writes output/nursery-animals/posters/a4/*-poster.png + preview.png
```

Commercial metadata for a bundle (Product Sprint 4):

```bash
npm run generate-metadata -- output/nursery-animals
# writes output/nursery-animals/metadata.json
```

API boot stub (after build):

```bash
npm run build -w @ai-product-factory/api
npm run start -w @ai-product-factory/api
```

## Monorepo layout

```
apps/api              Composition root + generate CLI (M10); REST later
apps/dashboard        Operator UI placeholder
packages/domain       Domain contracts: objects, Engine, strategies, ports
packages/application  Application use cases (orchestration; PipelineExecutor)
packages/infrastructure HTTP image base + OpenAIImageProvider
packages/shared       Shared kernel (empty)
tests/                Unit / integration-style tests
tools/etsy-research   Standalone Etsy research CLI (not part of product architecture)
```

No Turborepo, Nx, Lerna, or pnpm workspace tooling — npm workspaces only.

## Standalone tools

`tools/etsy-research` is an **internal developer utility** (Playwright + TypeScript). It is **not** wired into Generator, Pipeline, or ResearchProvider. See `tools/etsy-research/README.md`.

```bash
cd tools/etsy-research && npm install
npm run research -- "https://www.etsy.com/listing/<id>/<slug>"
npm run research-search -- "educational posters"
```

## Milestones

Engineering milestones: see `SYSTEM.md` §8 (M1–M11).  
Commercial Validation remains a business gate in `PROJECT.md`.

**Do not implement multiple milestones in one Cursor iteration.**
