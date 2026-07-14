# SYSTEM.md — AI Product Factory

> Engineering organization of the system.  
> Product scope lives in [`PROJECT.md`](./PROJECT.md). Decisions live in [`DECISIONS.md`](./DECISIONS.md).  
> This document describes **how** the software is structured—not why the business exists.

---

## 1. System Overview

AI Product Factory is an operator-driven pipeline that turns research input into exportable digital product packages. The **Generator Engine** is the technical center. Surrounding modules feed requests in and ship results out.

### Top-to-bottom stack

```
Dashboard
    ↓
REST API
    ↓
Application Layer
    ↓
Domain Layer
    ↓
Infrastructure Layer
```

| Layer | Responsibility |
|-------|----------------|
| **Dashboard** | Operator UI for products, queue, running jobs, generation history, and job status. Presentation only. |
| **REST API** | HTTP boundary: auth, request validation, DTO mapping, status codes. No business rules beyond input shaping. |
| **Application Layer** | Use cases and pipeline orchestration (run job, retry stage, export package). Coordinates domain services; does not own marketplace/API SDKs. |
| **Domain Layer** | Core objects, Generator Engine, strategies, Assembler/QA/Publisher **ports**, pipeline stage rules. Pure business meaning. |
| **Infrastructure Layer** | Implementations of providers (research import, text/image APIs, storage, filesystem export, DB, queues). Adapters only. |

Cross-cutting utilities that are not business rules live in **Shared** (see §2).

---

## 2. Layered Architecture

### Presentation

- Dashboard (web UI) and any CLI entrypoints that call the same API/use cases.
- Renders operational state; starts/retries jobs through the API.
- **Must not** contain generation logic, packaging rules, or provider SDKs.

### Application

- Application services / use cases: e.g. `IngestResearch`, `EnqueueJob`, `RunPipeline`, `RetryStage`, `ExportProduct`.
- Loads domain objects, invokes Domain services (Engine, Assembler, QA, Publisher), persists job state via ports.
- Maps API DTOs ↔ domain objects.

### Domain

- Business objects (§3), Generator Engine (§4), `GeneratorStrategy` contracts, Assembler/QA/Publisher domain services or ports, pipeline stage invariants.
- Depends only on abstractions (ports), never on concrete HTTP clients, cloud SDKs, or UI.

### Infrastructure

- Concrete `ResearchProvider`, `TextProvider`, `ImageProvider`, `MarketplaceProvider`, `StorageProvider` implementations.
- Database/persistence, file ZIP writers, preview image helpers that are I/O-bound, config/env wiring.
- Wired at composition root (DI). Replaceable without changing Domain.

### Shared

- Logging facades, result/error types, IDs, time helpers, pure serialization helpers.
- **No** product-category logic and **no** provider SDKs.

### Dependency rules

1. **Higher layers depend downward only**—and preferably on **interfaces** defined for the lower concern (ports), not concrete classes.
2. Allowed: Presentation → Application → Domain ← Infrastructure (Infrastructure implements Domain ports).
3. **Infrastructure must never leak into Domain** (no SDK types, DB entities, or HTTP models in domain objects).
4. Strategies may use provider **ports** (Text/Image/Storage) injected at runtime; they must not import Infrastructure packages.
5. Application may orchestrate; Domain owns rules. Presentation owns display only.

```
Presentation ──► Application ──► Domain ◄── Infrastructure
                      │             ▲
                      └──── ports ──┘
```

---

## 3. Core Domain Objects

Business objects only—responsibilities and lifecycle. No schemas or implementations.

| Object | Responsibility | Lifecycle |
|--------|----------------|-----------|
| **ResearchBrief** | Normalized niche/intent input: keywords, constraints, suggested product type hints, source metadata. | Created by Research ingest → used to build GenerationRequest → retained for history/audit. |
| **GenerationRequest** | Instruction to the Engine: strategy key, template params, brief reference, limits/cost caps. | Created by Application when a job enters Generate → consumed by Engine → immutable after start. |
| **GenerationResult** | Outcome of strategy execution: success/failure, AssetBundle reference, errors, rough cost. | Produced by Engine → consumed by Assembler (on success) or Job failure handling. |
| **AssetBundle** | Raw generated assets (files + asset-level metadata). Not a sellable listing yet. | Created by Strategy → stored → input to Assembler → may be reused on Assembler retry. |
| **ProductPackage** | Assembled sellable unit: organized files, ZIP, previews, listing metadata draft. | Created by Assembler → input to QA → on pass, input to Publisher. |
| **QAReport** | Validation outcome of a ProductPackage: hard fails, warnings, checklist results. | Created by QA → gates Publisher; stored with Job for operator review. |
| **PublishPackage** | Export- or publish-ready artifact (path/URI, manifest, mode: export vs marketplace). | Created by Publisher → delivered to operator or marketplace adapter; Job records location/status. |
| **Job** | Pipeline unit of work: stage states, links to Brief/Request/Results/Packages/Reports, retries. | `pending` → `running` → `succeeded` / `failed` / `cancelled`; stages advance Research → … → Publisher. |

Supporting concepts (not always separate persisted aggregates): **GeneratorTemplate** params (data attached to the request/strategy), **JobStage** status records for independent retries.

---

## 4. Generator Engine

The Engine is the heart of the Domain. It is **product-agnostic**.

### Contract

```
GenerationRequest
        ↓
Generator Engine
  • resolve strategy key
  • select GeneratorStrategy
  • execute strategy
        ↓
GenerationResult
```

### Rules

- Engine **receives** `GenerationRequest`, **selects** strategy, **executes**, **returns** `GenerationResult`.
- Engine contains **no** Clipart, Planner, Coloring Book, or any category-specific logic.
- All product behavior lives in **Generator Strategies** (+ their templates).
- Strategies produce **assets** (`AssetBundle` via `GenerationResult`)—not ZIPs, listing folders, or final marketplace payloads.
- Registration: strategies register by key; Application/composition root wires the First Commercial Generator (and later others) without changing Engine code.
- Strategies depend on provider **ports** (e.g. Image/Text/Storage) as needed; Engine does not call marketplaces.

---

## 5. Pipeline

```
Research → Generator → Assembler → QA → Publisher
```

| Stage | Input | Output | Notes |
|-------|-------|--------|-------|
| **Research** | Manual/CSV/external research source via `ResearchProvider` | `ResearchBrief` | Default = external/manual. No own Research Agent in early system. |
| **Generator** | `GenerationRequest` (from Brief + template params) | `GenerationResult` + `AssetBundle` | Engine + Strategy only. |
| **Assembler** | `AssetBundle` (+ brief/template metadata) | `ProductPackage` (files, ZIP, previews, metadata; PDF if required) | Packaging only—not generation. |
| **QA** | `ProductPackage` | `QAReport` (+ pass/fail gate) | Validates finished packages, not raw scraps. |
| **Publisher** | QA-passed `ProductPackage` | `PublishPackage` | MVP: **export** mode. Marketplace publish = later adapter. |

### Independent retries

| Retry | Allowed without full restart? |
|-------|-------------------------------|
| Research | Yes—re-ingest brief; downstream may need new request. |
| Generator | Yes—new `GenerationRequest`; typically new assets (costly). |
| Assembler | Yes—if `AssetBundle` retained; prefer this over regenerate. |
| QA | Yes—re-run rules after package fix; no regenerate if package unchanged. |
| Publisher | Yes—re-export / re-publish from QA-passed package. |

`Job` tracks per-stage status so Application can retry from the failed stage.

---

## 6. Providers

Interfaces only. Implementations live in Infrastructure.

| Provider | Responsibility |
|----------|----------------|
| **ResearchProvider** | Ingest external/manual research → emit `ResearchBrief` (CSV, EverBee-like import, manual form). Replaceable; own AI Research Agent is a future provider. |
| **TextProvider** | Generate or transform text (titles, descriptions, tags drafts) for strategies/assembler metadata as needed. |
| **ImageProvider** | Generate or transform images used by strategies (and optionally Assembler previews if treated as infra helper behind a port). |
| **MarketplaceProvider** | Marketplace-facing publish/list operations. Early: stub or unused; Export path does not require a live marketplace API. |
| **StorageProvider** | Persist/retrieve blobs and packages (assets, ZIPs, previews, exports); return stable URIs/paths for Jobs. |

### Provider rules

- Defined as Domain ports (or Application-facing ports owned next to Domain).
- **Replaceable** without changing Engine or pipeline stage contracts.
- Strategies use Text/Image/Storage ports; they **must not** call `MarketplaceProvider` directly.
- Publisher (Application/Domain publish service) is the only stage that talks to `MarketplaceProvider` or export filesystem via Storage.

---

## 7. Folder Structure

Modular, one responsibility per folder, Cursor-friendly (small blast radius per milestone).

```
/
├── PROJECT.md
├── DECISIONS.md
├── SYSTEM.md
├── README.md
├── apps/
│   ├── api/                 # REST API + composition root
│   └── dashboard/           # Operator UI (Presentation)
├── packages/
│   ├── domain/              # Domain objects, Engine, strategy ports, pipeline ports
│   │   ├── objects/
│   │   ├── engine/
│   │   ├── strategies/      # Strategy interfaces (+ later strategy packages split if needed)
│   │   ├── assembler/       # Assembler port / domain service contract
│   │   ├── qa/
│   │   └── publisher/
│   ├── application/         # Use cases, job orchestration, retries
│   ├── infrastructure/      # Provider implementations, DB, FS, external SDKs
│   │   ├── research/
│   │   ├── text/
│   │   ├── image/
│   │   ├── marketplace/
│   │   ├── storage/
│   │   └── persistence/
│   └── shared/              # Shared kernels (IDs, errors, logging facades)
├── strategies/              # Optional: one folder/package per GeneratorStrategy implementation
│   └── first-commercial/    # First Commercial Generator only (name TBD at business choice)
└── tests/
    ├── domain/
    ├── application/
    ├── infrastructure/
    └── e2e/
```

**Notes**

- `strategies/first-commercial` (or `packages/domain/strategies/...`) isolates category logic from Engine.
- Cursor milestones should touch **one** of: `domain/engine`, one strategy, `assembler`, `qa`, `publisher`, `dashboard`, or one provider folder.
- Do not dump SDKs into `domain/`.

---

## 8. Milestones

Engineering milestones derived from the approved roadmap. Each is independently implementable in ~one development session. **No implementation task breakdown here.**

| # | Milestone | Outcome |
|---|-----------|---------|
| M1 | **Project Skeleton** | Repo layout, apps/packages wiring, env conventions, empty composition root. |
| M2 | **Architecture Review Freeze** | Interfaces documented/frozen in code stubs or contracts only; no feature behavior yet. Blocking gate. |
| M3 | **Core Domain** | Domain objects (`ResearchBrief` … `Job`) as pure models + invariants. |
| M4 | **Generator Engine** | Product-agnostic Engine: Request → select → execute → Result (with fake/no-op strategy). |
| M5 | **Provider Ports** | Port interfaces for Research/Text/Image/Marketplace/Storage; null or fake adapters. |
| M6 | **First Commercial Generator** | One real strategy + minimal templates; assets only. |
| M7 | **Assembler** | AssetBundle → ProductPackage (ZIP, previews, metadata). |
| M8 | **Minimal Dashboard + API** | Products, queue, running jobs, history, job status; enqueue/retry hooks. |
| M9 | **QA Stage** | ProductPackage → QAReport; gate export. |
| M10 | **Export Publisher** | QA-passed package → PublishPackage (export mode); marketplace publish stub only. |
| M11 | **End-to-End Job Path** | Full pipeline job with stage retries; ready for batch runs. |

Commercial Validation (batch listings, marketplace signals, pass/pivot) remains a **business gate** in [`PROJECT.md`](./PROJECT.md)—not an engineering milestone.

**Post-validation (only if Commercial Validation passes):** later milestones for Analytics, Marketplace publish adapters, additional strategies, Research Agent provider—each still one session-sized slice.

**Rule:** Cursor implements **one milestone per iteration**. Never combine M4+M6+M7 in a single pass.

---

## 9. Engineering Rules

Mandatory.

1. **Domain must not depend on Infrastructure.**
2. **Infrastructure must not leak into Domain** (no SDK/DB/HTTP types in domain objects).
3. **Generator Engine must remain product-agnostic**—no category-specific branches.
4. **Generator Strategies own all product-specific behavior** (and templates).
5. **Strategies must not communicate directly with Marketplace providers.** Publishing goes through Publisher.
6. **Strategies produce assets only**; Assembler produces ProductPackages; QA validates finished packages.
7. **Providers must be replaceable** behind ports; swap implementations without Engine changes.
8. **Higher layers depend on lower abstractions**, not concrete infra.
9. **Every module should be independently testable** (domain/engine/strategy/assembler/qa with fakes).
10. **Pipeline stages must support independent retry** where inputs are retained.
11. **Export Publisher is the MVP publish path**; do not build marketplace automation inside early milestones.
12. **Dashboard remains operations-only** until post-validation analytics milestones.
13. **Cursor must never implement multiple milestones in one iteration.**
14. **Do not change `PROJECT.md` / `DECISIONS.md` from engineering work** without an explicit decision update.
15. If stuck between elegant design and shipping Export: **choose the thinner path that preserves ports.**

---

## Document Status

| Field | Value |
|-------|--------|
| Document | `SYSTEM.md` |
| Role | Engineering organization |
| Code | None in this step |
| Depends on | Approved `PROJECT.md`, `DECISIONS.md` |

*Change interfaces only via Architecture Review / decision log—not via silent refactors.*
