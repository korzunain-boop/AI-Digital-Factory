# Milestone Report — AI Product Factory

Living log of completed engineering milestones.  
Source of truth for product/architecture remains `PROJECT.md`, `DECISIONS.md`, and `SYSTEM.md`.

---

## Summary

| Milestone | Title                                                           | Status      |
| --------- | --------------------------------------------------------------- | ----------- |
| M1        | Project Skeleton                                                | Complete    |
| M2        | Architecture Baseline (contracts)                               | Complete    |
| M3        | Application Layer foundation                                    | Complete    |
| M4        | Generator Engine                                                | Complete    |
| M5+       | Provider ports / real adapters / First Commercial Generator / … | Not started |

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

## M4 — Generator Engine (this milestone)

**Date:** 2026-07-14

### What was implemented

1. **`DefaultGeneratorEngine`**
   - Accepts `GenerationRequest`
   - Resolves `GeneratorStrategy` by `strategyKey`
   - Executes strategy
   - Returns `GenerationResult`
   - Constructor-injected strategies (list or `GeneratorStrategyRegistry`)
   - Product-agnostic (no category logic)

2. **`InMemoryGeneratorStrategyRegistry`**
   - Maps strategy key → strategy
   - Built from injected strategy list

3. **Domain errors**
   - `DomainError`, `DomainErrorCodes`
   - Unknown strategy → `GenerationFailure` with `UNKNOWN_STRATEGY` (not a generic throw)
   - Strategy throws → `GenerationFailure` with `STRATEGY_EXECUTION_FAILED`

4. **`FakeGeneratorStrategy`**
   - Test-only minimal `GenerationSuccess`
   - No AI, images, filesystem, or marketplace

5. **Unit tests** (`tests/domain/generator-engine.test.ts`)
   - Strategy registration
   - Successful execution
   - Unknown strategy
   - Strategy exceptions
   - Statelessness between executions

### What remains for M5

Per `SYSTEM.md`, M5 is **Provider Ports** with null/fake adapters:

- Implement (or stub) Infrastructure adapters for `ResearchProvider`, `TextProvider`, `ImageProvider`, `StorageProvider`, `MarketplaceProvider`
- Still **no** real commercial generator
- Still **no** OpenAI/marketplace production integration required beyond fakes/nulls

### Possible future improvements (post-M4, not done now)

- Optional Engine metrics/cost aggregation across strategies
- Stronger typed error channel on `GenerationFailure` (structured code field) instead of `CODE: message` strings
- Strategy middleware (timeouts/cancellation) without putting product logic in the Engine
- Wire `DefaultGeneratorEngine` into Application `RunPipelineService` once stages are implemented

### Explicit non-goals of M4

- Real GeneratorStrategy (First Commercial Generator = M6)
- Provider implementations
- AI integrations
- Assembler / QA / Publisher behavior
- API endpoints

---

_Update this file at the end of each completed milestone._
