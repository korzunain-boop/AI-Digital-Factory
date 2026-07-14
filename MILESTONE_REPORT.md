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
| M8        | Prompt Generation Layer               | Complete    |
| M9        | HTTP Image Provider Infrastructure    | Complete    |
| M10+      | Assembler / Dashboard / QA / Export … | Not started |

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

**M8 — Prompt Generation Layer** — complete (see below).

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

## M8 — Prompt Generation Layer

**Date:** 2026-07-14

### Implemented

- `PromptBuilder` — GenerationRequest + template → `ImageGenerationPrompt`
- `DefaultPromptBuilder` — deterministic structured prompts (no LLM/HTTP)
- `ClipartGeneratorStrategy` flow:
  - GenerationRequest → PromptBuilder → ImageProvider → AssetBundle → GenerationResult
- `ImageProvider.generateImages` now accepts **`ImageGenerationPrompt` only** (never GenerationRequest)
- `FakeImageProvider` updated accordingly; stores `promptText` on asset metadata
- Unit tests for prompt generation, determinism, Clipart→PromptBuilder→ImageProvider, Engine integration
- GeneratorEngine unchanged

### Files Added / Changed

| Path                                                                   | Purpose                            |
| ---------------------------------------------------------------------- | ---------------------------------- |
| `packages/domain/src/prompts/image-generation-prompt.ts`               | `ImageGenerationPrompt`            |
| `packages/domain/src/prompts/prompt-builder.ts`                        | `PromptBuilder` + input            |
| `packages/domain/src/prompts/default-prompt-builder.ts`                | Deterministic DefaultPromptBuilder |
| `packages/domain/src/prompts/index.ts`                                 | Barrel exports                     |
| `packages/domain/src/providers/image-provider.ts`                      | Accepts ImageGenerationPrompt      |
| `packages/domain/src/providers/fake-image-provider.ts`                 | Uses prompt (incl. prompts[])      |
| `packages/domain/src/strategies/clipart/clipart-generator-strategy.ts` | Injects PromptBuilder              |
| `tests/domain/clipart-generator-strategy.test.ts`                      | M8 coverage                        |

### Interfaces Changed

| Change                                 | Why                                          |
| -------------------------------------- | -------------------------------------------- |
| `ImageGenerationPrompt`                | Structured prompt contract for ImageProvider |
| `PromptBuilder.build`                  | Owns prompt construction                     |
| `ImageProvider.generateImages(prompt)` | No longer takes theme/style raw request DTO  |
| Removed `ImageGenerationRequest`       | Replaced by ImageGenerationPrompt            |

### Tests

| Test                          | Asserts                                                             |
| ----------------------------- | ------------------------------------------------------------------- |
| Prompt generation             | theme/style/count/prompts/negativePrompt                            |
| Deterministic prompts         | identical inputs → identical ImageGenerationPrompt                  |
| Clipart uses PromptBuilder    | build called once before ImageProvider                              |
| ImageProvider receives prompt | lastPrompt / spy has prompts[]; no GenerationRequest fields         |
| Engine integration            | still works with Clipart + FakeImageProvider + DefaultPromptBuilder |

Run: `npm test` (19 tests).

### Known Limitations

1. Prompts are template-string deterministic — no LLM rewrite or optimization.
2. FakeImageProvider still does not call OpenAI/Flux.
3. PromptBuilderInput is Clipart-template-shaped for MVP (other product types later).
4. No Assembler / QA / Publisher / TextProvider / StorageProvider.

### Next Milestone

**M9 — HTTP Image Provider Infrastructure** — complete (see below).

### Self-review (M8)

**Why PromptBuilder exists**

- Separates “what to ask the model” from “how to call the model” and from “how to pack clipart SKUs”
- Keeps ImageProvider free of GenerationRequest / product domain coupling
- Makes prompts unit-testable and swappable (e.g. A/B builders later) without touching Engine

**How OpenAI or Flux will use it**

- Implement `ImageProvider.generateImages(prompt)`:
  - map `prompt.prompts[i]` (+ negativePrompt, size) to API calls
  - persist bytes via StorageProvider
  - return `GeneratedImages` with real locations
- Keep `DefaultPromptBuilder` (or a tuned builder) producing `ImageGenerationPrompt`
- ClipartGeneratorStrategy and GeneratorEngine stay unchanged

**Technical debt**

- Generalize PromptBuilderInput beyond Clipart template fields when a second product type appears
- Optionally add prompt versioning / catalog ids for marketplace audit
- Wire PromptBuilder + FakeImageProvider (then real provider) in composition root

---

## M9 — HTTP Image Provider Infrastructure

**Date:** 2026-07-14

### Implemented

- Reusable `HttpImageProviderBase` — generic HTTP responsibilities only:
  - HTTP client abstraction (`HttpClient`)
  - Bearer auth headers from injected config
  - request execution + timeout (via `HttpRequest.timeoutMs`)
  - retry policy for transient failures
  - response status validation + JSON parse
  - HTTP/raw error → provider error hierarchy
- Injected `ImageProviderConfig` (`apiKey`, `baseUrl`, `model`, `timeoutMs`, `retries`) — no globals/hardcoded secrets
- Provider error hierarchy: `AuthenticationError`, `RateLimitError`, `InvalidResponseError`, `ProviderUnavailableError`, `ProviderTimeoutError`
- `FetchHttpClient` (production adapter; unused by unit tests)
- Demonstration `OpenAIImageProvider` — **all** OpenAI-specific paths/payloads/parsing isolated here
- Domain `ImageProvider` contract unchanged; Engine / PipelineExecutor / PromptBuilder / Clipart unchanged
- Returns image URLs or `data:` binary payloads per existing `GeneratedImages` contract (no StorageProvider)

### Files Added

| Path                                                                          | Purpose                                 |
| ----------------------------------------------------------------------------- | --------------------------------------- |
| `packages/infrastructure/src/http/http-client.ts`                             | HttpClient / HttpRequest / HttpResponse |
| `packages/infrastructure/src/http/fetch-http-client.ts`                       | Fetch-based HttpClient                  |
| `packages/infrastructure/src/providers/image/image-provider-config.ts`        | Injected ImageProviderConfig            |
| `packages/infrastructure/src/providers/image/provider-errors.ts`              | Provider error hierarchy                |
| `packages/infrastructure/src/providers/image/http-image-provider-base.ts`     | Reusable HTTP base (vendor-agnostic)    |
| `packages/infrastructure/src/providers/image/openai/openai-image-provider.ts` | OpenAI Images demo adapter              |
| `packages/infrastructure/src/index.ts`                                        | Public exports                          |
| `tests/infrastructure/openai-image-provider.test.ts`                          | Mocked HTTP unit tests                  |

### Tests

| Test                        | Asserts                                          |
| --------------------------- | ------------------------------------------------ |
| Successful URL response     | GeneratedImages location + auth/model on request |
| Successful b64_json         | location is data:image/png;base64,…              |
| Authentication 401/403      | AuthenticationError; no raw fetch errors         |
| Timeout (AbortError)        | ProviderTimeoutError                             |
| Invalid JSON / missing data | InvalidResponseError                             |
| Error translation 429/503   | RateLimitError / ProviderUnavailableError        |
| Network failure             | ProviderUnavailableError                         |
| Retries                     | retries then success; no retry on auth           |
| Config validation           | apiKey required; baseUrl trailing slash stripped |

Run: `npm test` (mocked HttpClient only — no live network / no real API keys).

### Known Limitations

1. Composition root does **not** wire `OpenAIImageProvider` yet — Clipart still uses `FakeImageProvider` in tests.
2. No StorageProvider — URLs / data-URLs are returned as `GeneratedImage.location` only.
3. No real API key, no live OpenAI calls.
4. `FetchHttpClient` exists but is not exercised by M9 unit tests (by design).
5. OpenAI is one demo vendor; Flux/Ideogram would be additional subclasses of the same base.
6. `RunPipelineService` still NotImplemented; Research/Assembler/QA/Publisher still placeholders.

### Next Milestone

**Assembler** (or next engineering milestone per active roadmap): package AssetBundles into ProductPackages. Optionally wire composition root: config → OpenAIImageProvider → Clipart — first real image path without changing Engine/Pipeline/PromptBuilder/Clipart.

### Self-review (M9)

**Why provider switching is now easy**

- Domain still depends only on `ImageProvider`
- Shared HTTP concerns live in `HttpImageProviderBase` + injected `ImageProviderConfig` + `HttpClient`
- New vendors = new subclass under `providers/image/<vendor>/` implementing `doGenerateImages`
- Swap at composition root: `new ClipartGeneratorStrategy(promptBuilder, new FluxImageProvider(config, http))` — Engine / Pipeline / PromptBuilder / Clipart stay untouched

**Remaining work before the first real image**

1. Map env → `ImageProviderConfig` in composition root (no hardcoded secrets in code)
2. Wire `OpenAIImageProvider` + `FetchHttpClient` into Clipart registration
3. Provide a real API key via env at runtime (never committed)
4. Optional: StorageProvider to persist bytes instead of remote URLs / data-URLs
5. Optional: stub Research so a full pipeline job can reach Generator

**Technical debt**

- Retry backoff is immediate re-attempt (no jitter/backoff delays yet)
- `ProviderUnavailableError` also covers non-2xx client errors outside 401/403/429 — may want finer codes later
- OpenAI size mapping is a coarse width/height → enum heuristic
- Negative prompts unused by OpenAI Images API mapping (left in Domain prompt for other vendors)
- Composition root still does not assemble the real provider graph

---

_Update this file at the end of each completed milestone._
