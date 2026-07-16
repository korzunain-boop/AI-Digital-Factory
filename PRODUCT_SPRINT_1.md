# Product Sprint 1 — Illustration Collection Bundle

> Product sprint report (not an architecture change).  
> `PROJECT.md`, `DECISIONS.md`, and `SYSTEM.md` remain frozen and unchanged.  
> Previous engineering milestones (M1–M10 ImageProvider pipeline) were not redesigned.

## Goal

Automatically generate a complete illustration collection for one theme:

```
Theme
  → LLM → Style Guide
  → LLM → illustration subjects
  → LLM → prompts
  → ImageProvider → PNGs + JSON
```

User provides **only the theme** (e.g. `"Nursery Animals"`, `"Ocean"`, `"Dinosaurs"`).

No layout, PDF, ZIP, preview, marketplace, QA, or dashboard.

## Implemented

1. **`LLMProvider` abstraction** (Domain) + **`FakeLLMProvider`** (tests / offline CLI). No OpenAI LLM adapter yet.
2. LLM generates **Style Guide** once (palette, style, composition, lighting, mood, negatives).
3. LLM generates **illustration subjects** (default count **24**).
4. LLM generates **one prompt per subject** (Style Guide reused; subject varies).
5. Existing **ImageProvider** pipeline unchanged (`FakeImageProvider` / `OpenAIImageProvider`).
6. Disk output under `output/<theme-slug>/`: PNGs + `style-guide.json` + `prompts.json` + `bundle.json`.
7. **CLI:** `npm run generate-bundle -- "Nursery Animals"`

### Removed

- Hardcoded Style Guide presets / theme hash palettes
- Static subject arrays (e.g. nursery animal lists)
- `switch(theme)` / theme-catalog branching
- Hardcoded prompt template composer

## Files

| Path                                                 | Purpose                                |
| ---------------------------------------------------- | -------------------------------------- |
| `packages/domain/src/providers/llm-provider.ts`      | LLMProvider port                       |
| `packages/domain/src/providers/fake-llm-provider.ts` | Fake LLM (deterministic JSON)          |
| `apps/api/src/bundle/llm-bundle-content.ts`          | LLM → Style Guide / subjects / prompts |
| `apps/api/src/bundle/style-guide.ts`                 | StyleGuide type + parse/validate       |
| `apps/api/src/bundle/bundle-generator.ts`            | Orchestrator                           |
| `apps/api/src/bundle/save-bundle.ts`                 | PNG/JSON writer                        |
| `apps/api/src/cli/generate-bundle.ts`                | CLI                                    |
| `tests/api/bundle-generator.test.ts`                 | Mocked LLM + ImageProvider tests       |

## Tests

- Style Guide via mocked LLM
- Subjects via mocked LLM (any theme; no static catalogs)
- Prompts via mocked LLM
- Full bundle: 3 LLM calls then 1 ImageProvider call; writes artifacts

Run: `npm test`

## Explicit non-goals

Poster layout, PDF, ZIP, preview, Marketplace, QA, Dashboard, Assembler, **real OpenAI LLM adapter**.

## Self-review

### How visual consistency is maintained

- One Style Guide is produced by the LLM and locked for the pack.
- Subject and prompt LLM calls receive that Style Guide.
- Prompt instructions require shared style with subject-only variation.
- ImageProvider still gets a single batch prompt with shared `style` / `negativePrompt`.

### What remains before commercial-ready posters

Assembler/layout, PDF/ZIP, previews, QA, durable storage, Commercial Validation, and a **real LLMProvider adapter** (OpenAI or other) replacing `FakeLLMProvider`.
