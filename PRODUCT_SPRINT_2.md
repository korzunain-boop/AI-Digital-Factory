# Product Sprint 2 — CreativeDirector

> Product sprint report. Architecture docs remain frozen.  
> ImageProvider, PromptBuilder, and GeneratorEngine were **not** changed.

## Goal

Introduce a Domain **CreativeDirector** responsible for the creative identity of a bundle. Bundle generation no longer talks to `LLMProvider` directly.

## Architecture

```
Domain
  CreativeDirector (interface)
       ↓
Infrastructure
  LLMCreativeDirector
       ↓
  LLMProvider
```

`BundleGenerator` depends on **CreativeDirector** only.

## Implemented

1. Domain `CreativeDirector` — `createStyleGuide` / `createSubjects` / `createPrompts`
2. Domain `StyleGuide` + `parseStyleGuide` (moved from apps/api)
3. Domain `FakeCreativeDirector` for unit tests
4. Infrastructure `LLMCreativeDirector` (uses `LLMProvider`)
5. `generateIllustrationBundle(images, director, input)` — CreativeDirector, not LLMProvider
6. CLI wires `new LLMCreativeDirector(new FakeLLMProvider())`

## Files

| Path                                                            | Purpose                                          |
| --------------------------------------------------------------- | ------------------------------------------------ |
| `packages/domain/src/creative/creative-director.ts`             | CreativeDirector port                            |
| `packages/domain/src/creative/style-guide.ts`                   | StyleGuide type + parse                          |
| `packages/domain/src/creative/fake-creative-director.ts`        | Fake for tests                                   |
| `packages/infrastructure/src/creative/llm-creative-director.ts` | LLM-backed impl                                  |
| `apps/api/src/bundle/bundle-generator.ts`                       | Depends on CreativeDirector                      |
| `tests/api/bundle-generator.test.ts`                            | FakeCreativeDirector + LLMCreativeDirector tests |
| `PRODUCT_SPRINT_2.md`                                           | This report                                      |

## Tests

- FakeCreativeDirector consistency (style → subjects → prompts)
- BundleGenerator with FakeCreativeDirector + FakeImageProvider
- LLMCreativeDirector with FakeLLMProvider (3 LLM purposes)

Run: `npm test`

## Unchanged

ImageProvider, PromptBuilder, GeneratorEngine, Assembler/QA/Publisher.

## Self-review

### Why this improves maintainability and future provider switching

- **Domain isolation:** Bundle orchestration expresses creative intent (`CreativeDirector`) without knowing prompts, JSON schemas, or LLM vendors.
- **Single seam for creativity:** Style Guide, subjects, and prompts stay one coherent service — consistency rules live with the director, not scattered in the generator.
- **Provider switching:** Swap `LLMCreativeDirector` for a rules-based, cached, or multi-model director without touching BundleGenerator or ImageProvider.
- **Testability:** `FakeCreativeDirector` tests the bundle path without LLM fakes; `LLMCreativeDirector` tests the LLM adapter in isolation.
- **Clear layers:** Domain ← CreativeDirector; Infrastructure ← LLM; apps ← wiring. Matches the frozen ports-and-adapters architecture.
