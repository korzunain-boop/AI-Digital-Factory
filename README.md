# AI Product Factory

Source of truth (repo root):

- [`PROJECT.md`](./PROJECT.md) — product vision, MVP, roadmap, validation
- [`DECISIONS.md`](./DECISIONS.md) — architectural decision log
- [`SYSTEM.md`](./SYSTEM.md) — engineering organization

## Project Status

| Field                          | Status                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| **Current Milestone**          | M3 — Application Layer foundation (orchestration contracts)                           |
| **Architecture Status**        | Approved; Domain + Application contracts in place; no stage behavior yet              |
| **Business Validation Status** | Not started (gate defined in `PROJECT.md`)                                            |
| **Generator Status**           | Strategy/Engine **interfaces only** — First Commercial Generator not implemented (M6) |
| **Research Status**            | `ResearchProvider` port only — no adapter implementation yet                          |
| **Publisher Status**           | `Publisher` / `ExportProductService` contracts only — export not implemented yet      |

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
| `npm run lint`         | ESLint (minimal defaults)                |
| `npm run format`       | Prettier write                           |
| `npm run format:check` | Prettier check                           |

API boot stub (after build):

```bash
npm run build -w @ai-product-factory/api
npm run start -w @ai-product-factory/api
```

## Monorepo layout

```
apps/api              REST API + composition root (empty wiring in M1/M2)
apps/dashboard        Operator UI placeholder (empty until M8)
packages/domain       Domain contracts: objects, Engine, strategies, Assembler, QA, Publisher, providers
packages/application  Application use cases (M3 orchestration contracts; NotImplemented)
packages/infrastructure Provider implementations (empty until later milestones)
packages/shared       Shared kernel (empty)
tests/                Tests root (empty until tests exist)
```

No Turborepo, Nx, Lerna, or pnpm workspace tooling — npm workspaces only.

## Milestones

Engineering milestones: see `SYSTEM.md` §8 (M1–M11).  
Commercial Validation remains a business gate in `PROJECT.md`.

**Do not implement multiple milestones in one Cursor iteration.**
