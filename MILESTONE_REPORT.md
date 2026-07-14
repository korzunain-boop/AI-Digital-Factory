# Milestone Report — AI Product Factory

Living log of completed engineering milestones.  
Source of truth for product/architecture remains `PROJECT.md`, `DECISIONS.md`, and `SYSTEM.md`.

---

## Summary

| Milestone | Title                                 | Status      |
| --------- | ------------------------------------- | ----------- |
| M1        | Project Skeleton                      | Complete    |
| M2        | Architecture Baseline (contracts)     | Complete    |
| M3        | Application Layer foundation          | Complete    |
| M4        | Generator Engine                      | Complete    |
| M5        | Pipeline Execution                    | Complete    |
| M6        | First Commercial Generator (Clipart)  | Complete    |
| M7        | Image Provider Abstraction            | Complete    |
| M8+       | Assembler / Dashboard / QA / Export … | Not started |

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

**M6 — First Commercial Generator** — complete (see below).

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

## M6 — First Commercial Generator Skeleton (Clipart)

**Date:** 2026-07-14

### Implemented

- `ClipartGeneratorStrategy` — first commercial `GeneratorStrategy` (`key: clipart`)
- Minimal `ClipartGeneratorTemplate`: `theme`, `style`, `assetCount`
- Deterministic fake assets shaped like future image-provider output:
  - asset ids, filenames, PNG media type
  - opaque `memory://clipart/…` locations (not filesystem)
  - metadata: tags, preview descriptors, prompt descriptors, dimensions
  - full `AssetBundle` on `GenerationSuccess.assetBundle`
- `DefaultGeneratorEngine` runs Clipart **without Engine modifications**
- Unit tests: template application, asset count, determinism, Engine integration

### Files Added

| Path                                                                   | Purpose                           |
| ---------------------------------------------------------------------- | --------------------------------- |
| `packages/domain/src/strategies/clipart/clipart-template.ts`           | MVP template parse/serialize      |
| `packages/domain/src/strategies/clipart/clipart-generator-strategy.ts` | Clipart strategy + bundle builder |
| `packages/domain/src/strategies/clipart/index.ts`                      | Barrel exports                    |
| `tests/domain/clipart-generator-strategy.test.ts`                      | M6 unit tests                     |

### Interfaces Changed

| Change                                        | Why                                                                                          |
| --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `GenerationSuccess.assetBundle?: AssetBundle` | Carry full in-memory bundle until StorageProvider exists; shape matches future provider flow |
| `ClipartGeneratorTemplate`                    | Typed MVP template (theme/style/assetCount) over opaque `GeneratorTemplateParams`            |
| `CLIPART_STRATEGY_KEY`                        | Stable Engine registry key                                                                   |

Engine / PipelineExecutor unchanged.

### Tests

| Test                 | Asserts                                                    |
| -------------------- | ---------------------------------------------------------- |
| Template applied     | theme/style/productType metadata + per-asset tags/previews |
| Asset count          | `assets.length === assetCount`                             |
| Limits cap           | `maxAssets` lowers count when smaller than template        |
| Deterministic        | identical request → identical bundle                       |
| Engine integration   | register Clipart → Engine returns clipart bundle           |
| parseClipartTemplate | reads theme/style/assetCount                               |

Run: `npm test` (16 tests: M4 Engine + M5 Pipeline + M6 Clipart).

### Known Limitations

1. Assets are **deterministic placeholders** — no OpenAI, no image bytes, no filesystem writes.
2. `memory://` locations are opaque placeholders for future Storage/Image providers.
3. No Assembler/QA/Publisher/Research implementations.
4. Composition root does not yet wire Clipart into API bootstrap (register at composition when M8/API lands).
5. In-memory `assetBundle` on result may become Storage-backed later (id + locations only).

### Next Milestone

**M7 — Image Provider Abstraction** — complete (see below).

### Self-review (M6)

**What is still fake**

- Pixel data / AI image generation
- Storage persistence (uses `memory://` URIs)
- Listing copy quality beyond template-derived hints

**What OpenAI/image APIs can replace later without architecture change**

- Inside `ClipartGeneratorStrategy.generate` (or a private helper): call `ImageProvider` to produce bytes, `StorageProvider.put` for locations
- Keep returning `AssetBundle` + `GenerationResult` with same shapes
- Engine, PipelineExecutor, and Assembler contracts stay the same

**Technical debt**

- Persist bundles via JobRepository/Storage instead of optional in-result `assetBundle`
- Wire Clipart into composition root + CreateJob strategyKey defaults
- Optional richer template fields (palette, pack naming) only after Commercial Validation needs them

---

## M7 — Image Provider Abstraction

**Date:** 2026-07-14

### Implemented

- `ImageProvider.generateImages(request) → GeneratedImages` (batch port; replaces prior single-image draft API)
- `FakeImageProvider` — deterministic fake images matching former M6 Clipart inline assets
- `ClipartGeneratorStrategy` now **depends on ImageProvider** (constructor injection):
  - GenerationRequest → ImageProvider → AssetBundle → GenerationResult
  - No longer builds image descriptors itself
- `DefaultGeneratorEngine` unchanged
- Unit tests: provider called, determinism, provider exceptions, Engine integration

### Files Added / Changed

| Path                                                                   | Purpose                                                        |
| ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| `packages/domain/src/providers/image-provider.ts`                      | `ImageGenerationRequest`, `GeneratedImage(s)`, `ImageProvider` |
| `packages/domain/src/providers/fake-image-provider.ts`                 | Deterministic FakeImageProvider                                |
| `packages/domain/src/strategies/clipart/clipart-generator-strategy.ts` | Delegates to ImageProvider; assembles AssetBundle              |
| `tests/domain/clipart-generator-strategy.test.ts`                      | Updated/extended M7 tests                                      |

### Interfaces Changed

| Change                                                              | Why                                                               |
| ------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `ImageProvider.generateImages` + `GeneratedImages`                  | Explicit batch contract; strategies no longer invent image assets |
| Removed unused single-shot `generate` / `ImageGenerateInput` draft  | Align Domain port with M7 responsibility (“nothing more”)         |
| `ClipartGeneratorStrategy(images: ImageProvider)`                   | Required dependency injection of image generation                 |
| `assembleClipartAssetBundle` (was inline `buildClipartAssetBundle`) | Strategy only maps provider output + clipart pack metadata        |

### Tests

| Test                  | Asserts                                                |
| --------------------- | ------------------------------------------------------ |
| Calls ImageProvider   | `FakeImageProvider.invocationCount === 1`              |
| Template via provider | theme/style/count on AssetBundle from provider images  |
| Asset count           | `assets.length === 7` etc.                             |
| Deterministic         | identical requests → identical bundles                 |
| Provider exceptions   | `IMAGE_PROVIDER_FAILED` GenerationFailure              |
| Engine integration    | Clipart + FakeImageProvider via DefaultGeneratorEngine |
| Spy request fields    | count/theme/style/purpose passed into `generateImages` |

Run: `npm test`.

### Known Limitations

1. `FakeImageProvider` still does not produce real pixels or call AI APIs.
2. No StorageProvider — locations remain `memory://…`.
3. No TextProvider / Assembler / QA / Publisher / marketplace.
4. Composition root not yet wiring `new ClipartGeneratorStrategy(new FakeImageProvider())`.

### Next Milestone

**M8** (product roadmap / dashboard) or **Assembler** per `SYSTEM.md` M7 historically — implement Packaging of AssetBundles. Real OpenAI ImageProvider is a later infrastructure swap, not a pipeline redesign.

### Self-review (M7)

**What changed**

- Image descriptors moved from Clipart strategy into ImageProvider
- Clipart only parses template, calls provider, wraps AssetBundle metadata

**Why architecture improved**

- Strategy stays product logic (template → pack); provider stays generation transport
- OpenAI/Flux/Ideogram can implement `ImageProvider` without touching Engine or PipelineExecutor
- Clear seam for testing with FakeImageProvider / spies

**What M8 (or next) will replace**

- FakeImageProvider → real ImageProvider adapter (OpenAI etc.)
- Optionally StorageProvider for durable locations instead of `memory://`
- Assembler consumes AssetBundles into ProductPackages

---

_Update this file at the end of each completed milestone._
