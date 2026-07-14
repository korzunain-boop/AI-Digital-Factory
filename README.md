# AI Product Factory

Source of truth (repo root):

- [`PROJECT.md`](./PROJECT.md) — product vision, MVP, roadmap, validation
- [`DECISIONS.md`](./DECISIONS.md) — architectural decision log
- [`SYSTEM.md`](./SYSTEM.md) — engineering organization
- [`MILESTONE_REPORT.md`](./MILESTONE_REPORT.md) — completed milestone log

## Project Status

| Field                          | Status                                                                 |
| ------------------------------ | ---------------------------------------------------------------------- |
| **Current Milestone**          | M10 — First Real Image Generation                                      |
| **Architecture Status**        | Approved; composition root switches Fake ↔ OpenAI via env              |
| **Business Validation Status** | Not started (gate defined in `PROJECT.md`)                             |
| **Generator Status**           | Clipart wired; `npm run generate` (Fake default / OpenAI with API key) |
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

| Command                | Purpose                                  |
| ---------------------- | ---------------------------------------- |
| `npm run build`        | Build all workspaces that define `build` |
| `npm test`             | Build packages + run unit tests (`tsx`)  |
| `npm run generate`     | Run Clipart via GeneratorEngine (CLI)    |
| `npm run lint`         | ESLint (minimal defaults)                |
| `npm run format`       | Prettier write                           |
| `npm run format:check` | Prettier check                           |

Generate (Fake by default — no API key):

```bash
npm run generate
```

Generate with OpenAI (real image; requires key in `.env` or env):

```bash
# .env: IMAGE_PROVIDER=openai, OPENAI_API_KEY=sk-..., OPENAI_IMAGE_MODEL=dall-e-3
IMAGE_PROVIDER=openai npm run generate
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
```

No Turborepo, Nx, Lerna, or pnpm workspace tooling — npm workspaces only.

## Milestones

Engineering milestones: see `SYSTEM.md` §8 (M1–M11).  
Commercial Validation remains a business gate in `PROJECT.md`.

**Do not implement multiple milestones in one Cursor iteration.**
