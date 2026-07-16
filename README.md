# AI Product Factory

Source of truth (repo root):

- [`PROJECT.md`](./PROJECT.md) — product vision, MVP, roadmap, validation
- [`DECISIONS.md`](./DECISIONS.md) — architectural decision log
- [`SYSTEM.md`](./SYSTEM.md) — engineering organization
- [`MILESTONE_REPORT.md`](./MILESTONE_REPORT.md) — completed milestone log
- [`PRODUCT_SPRINT_1.md`](./PRODUCT_SPRINT_1.md) — illustration collection bundle sprint

## Project Status

| Field                          | Status                                                                 |
| ------------------------------ | ---------------------------------------------------------------------- |
| **Current Milestone**          | Product Sprint 1 — Illustration Collection Bundle                      |
| **Architecture Status**        | Approved; frozen (PROJECT / DECISIONS / SYSTEM unchanged)              |
| **Business Validation Status** | Not started (gate defined in `PROJECT.md`)                             |
| **Generator Status**           | Clipart + `npm run generate-bundle` (Style Guide → 24 illustrations)   |
| **Research Status**            | NotImplemented placeholder (tests may stub success to reach Generator) |
| **Publisher Status**           | NotImplemented placeholder — export not implemented yet                |

## Prerequisites

- Node.js 20+
- npm (bundled with Node; plain npm workspaces only)

## Setup

```bash
npm install
cp .env.example .env
```

## Scripts

| Command                   | Purpose                                    |
| ------------------------- | ------------------------------------------ |
| `npm run build`           | Build all workspaces that define `build`   |
| `npm test`                | Build packages + run unit tests (`tsx`)    |
| `npm run generate`        | Run Clipart via GeneratorEngine (CLI)      |
| `npm run generate-bundle` | Product Sprint 1 — illustration collection |
| `npm run research`        | Standalone Etsy listing scrape (dev tool)  |
| `npm run research-search` | Standalone Etsy search scrape (dev tool)   |
| `npm run lint`            | ESLint (minimal defaults)                  |
| `npm run format`          | Prettier write                             |
| `npm run format:check`    | Prettier check                             |

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
# writes output/nursery-animals/{elephant,lion,...}.png + style-guide.json + prompts.json + bundle.json
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
