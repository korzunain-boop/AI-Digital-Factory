# Milestone Report — AI Product Factory

Living log of completed engineering milestones.  
Source of truth for product/architecture remains `PROJECT.md`, `DECISIONS.md`, and `SYSTEM.md`.

---

## Summary

| Milestone | Title                                      | Status      |
| --------- | ------------------------------------------ | ----------- |
| M1        | Project Skeleton                           | Complete    |
| M2        | Architecture Baseline (contracts)          | Complete    |
| M3        | Application Layer foundation               | Complete    |
| M4        | Generator Engine                           | Complete    |
| M5        | Pipeline Execution                         | Complete    |
| M6+       | First Commercial Generator / Assembler / … | Not started |

---

## M1 — Project Skeleton

**Outcome:** npm workspaces monorepo (`apps/*`, `packages/*`), env/editor tooling, ESLint/Prettier/Husky/lint-staged, empty composition root, README Project Status.

**Not included:** Domain behavior, providers, generators, API routes, dashboard UI.

---

## M2 — Architecture Baseline

**Outcome:** Domain object shapes and ports only — `ResearchBrief` … `Job`, `GeneratorEngine` / `GeneratorStrategy` interfaces, Assembler/QA/Publisher ports, provider ports. Zero SDK/HTTP/FS/marketplace code.

**Not included:** Engine behavior, strategies, provider implementations.

---

## M3 — Application Layer Foundation

**Outcome:** Orchestration use cases with constructor injection of Domain ports:

- `CreateJobService`
- `RunPipelineService`
- `RetryPipelineStageService`
- `CancelJobService`
- `ExportProductService`

Plus application port `JobRepository` and thin commands. All `execute` methods throw `NotImplementedError`.

**Not included:** Real pipeline runs, persistence, API, generation.

---

## M4 — Generator Engine

**Outcome:** `DefaultGeneratorEngine`, strategy registry injection, domain errors (`UNKNOWN_STRATEGY`, `STRATEGY_EXECUTION_FAILED`), `FakeGeneratorStrategy`, Engine unit tests.

**Not included:** Real generators, providers, AI.

---

## M5 — Pipeline Execution

**Date:** 2026-07-14

### Implemented

- `PipelineExecutor` — runs Job through Research → Generator → Assembler → QA → Publisher
- Stops on first stage **Failure**; marks later stages **Skipped**
- Generator stage invokes existing `GeneratorEngine` (only executable stage)
- Placeholder Domain-port implementations:
  - `NotImplementedResearchProvider`
  - `NotImplementedAssembler`
  - `NotImplementedQA`
  - `NotImplementedPublisher`
- Stage result language: `Success` | `Failure` | `Skipped`
- Ordered stage runners (array) — no product-type switches
- Unit tests for order, Generator execution, single Engine call, stop-on-failure, skipped stages

### Files Added

| Path                                                                       | Purpose                                 |
| -------------------------------------------------------------------------- | --------------------------------------- |
| `packages/application/src/pipeline/pipeline-executor.ts`                   | Orchestrator                            |
| `packages/application/src/pipeline/stage-result.ts`                        | Success/Failure/Skipped types           |
| `packages/application/src/pipeline/pipeline-run-context.ts`                | Run context                             |
| `packages/application/src/pipeline/pipeline-stage-runner.ts`               | Stage runner contract                   |
| `packages/application/src/pipeline/job-stage-updates.ts`                   | Immutable Job stage helpers             |
| `packages/application/src/pipeline/stages/generator-stage-runner.ts`       | Generator → Engine                      |
| `packages/application/src/pipeline/stages/placeholder-stage-runners.ts`    | Research/Assembler/QA/Publisher runners |
| `packages/application/src/pipeline/placeholders/not-implemented-stages.ts` | NotImplemented Domain ports             |
| `packages/application/src/pipeline/index.ts`                               | Barrel exports                          |
| `tests/application/pipeline-executor.test.ts`                              | M5 unit tests                           |

### Interfaces Added

| Name                                                             | Role                                                |
| ---------------------------------------------------------------- | --------------------------------------------------- |
| `StageResult` / `StageSuccess` / `StageFailure` / `StageSkipped` | Pipeline stage language                             |
| `StageArtifactIds`                                               | Optional artifact ids from a stage                  |
| `PipelineStageRunner`                                            | Stage runner contract                               |
| `PipelineRunContext`                                             | Job + GenerationRequest (+ optional research input) |

_(Domain port interfaces reused; NotImplemented_ are implementations, not new Domain contracts.)*

### Tests

| Test                   | Asserts                                                     |
| ---------------------- | ----------------------------------------------------------- |
| Stage order            | Research → Generator → Assembler → QA → Publisher           |
| Generator executes     | Generator stage succeeded; assetBundleId set via Engine     |
| Engine once            | `FakeGeneratorStrategy.invocationCount === 1`               |
| Stop on failure        | Assembler NotImplemented → Job failed; QA/Publisher skipped |
| Generator failure skip | Strategy error fails Generator; later stages skipped        |

Run: `npm test` (10 tests total with M4 Engine suite).

### Known Limitations

1. With production `NotImplementedResearchProvider`, pipeline fails at Research and never reaches Generator — tests inject a successful research stub only for M5 verification.
2. Assembler/QA/Publisher runners pass minimal stub Domain objects into placeholder ports (which throw before using them).
3. `RunPipelineService` (M3) still throws NotImplemented — not yet wired to `PipelineExecutor`.
4. No persistence (`JobRepository`), API, filesystem export, AI, or marketplace.
5. No real Research / Assembler / QA / Publisher behavior.

### Next Milestone

**M6 — First Commercial Generator** (per `SYSTEM.md` / product roadmap): implement the first real `GeneratorStrategy` after niche validation. Still no full Assembler/QA/Publisher unless scoped separately afterward.

### Self-review (M5)

**Strengths**

- Clear Success/Failure/Skipped language aligned with Job stage statuses
- Generator isolation via Engine keeps product types out of the orchestrator
- DI-friendly placeholders replace independently

**Weaknesses**

- Research NotImplemented blocks end-to-end “happy” runs outside tests
- Stub Domain objects in Assembler/QA/Publisher runners are awkward until real stages exist

**Technical debt**

- Wire `RunPipelineService` → `PipelineExecutor` + `JobRepository`
- Replace stub assemble/validate/publish inputs with stored artifacts from prior stages
- Consider structured stage error codes (not only strings)

**Recommendations for M6**

- Implement First Commercial Generator strategy only; keep PipelineExecutor unchanged
- Register strategy in composition root; Engine already selects by key
- Defer real Assembler until after Generator produces real assets worth packaging

---

_Update this file at the end of each completed milestone._
