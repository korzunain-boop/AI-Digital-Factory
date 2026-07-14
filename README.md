# AI Product Factory

Source of truth (repo root):

- [`PROJECT.md`](./PROJECT.md) — product vision, MVP, roadmap, validation
- [`DECISIONS.md`](./DECISIONS.md) — architectural decision log
- [`SYSTEM.md`](./SYSTEM.md) — engineering organization

## Project Status

| Field                          | Status                                                                        |
| ------------------------------ | ----------------------------------------------------------------------------- |
| **Current Milestone**          | M1 — Project Skeleton                                                         |
| **Architecture Status**        | Approved (`SYSTEM.md`); skeleton only — not implemented beyond empty packages |
| **Business Validation Status** | Not started (gate defined in `PROJECT.md`)                                    |
| **Generator Status**           | Not implemented (First Commercial Generator = M6)                             |
| **Research Status**            | External/manual planned; no provider code yet                                 |
| **Publisher Status**           | Export-first planned; not implemented                                         |

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
apps/api              REST API + composition root (empty in M1)
apps/dashboard        Operator UI placeholder (empty in M1)
packages/domain       Domain layer (empty folders reserved)
packages/application  Application use cases (empty)
packages/infrastructure Provider implementations (empty)
packages/shared       Shared kernel (empty)
tests/                Tests root (empty until tests exist)
```

No Turborepo, Nx, Lerna, or pnpm workspace tooling — npm workspaces only.

## Milestones

Engineering milestones: see `SYSTEM.md` §8 (M1–M11).  
Commercial Validation remains a business gate in `PROJECT.md`.

**Do not implement multiple milestones in one Cursor iteration.**
