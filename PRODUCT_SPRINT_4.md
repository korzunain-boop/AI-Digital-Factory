# Product Sprint 4 — Commercial Product Metadata

> Product sprint report. Architecture docs remain frozen.  
> ImageProvider, PromptBuilder, GeneratorEngine, and LayoutEngine were **not** redesigned.

## Goal

Generate commercial metadata for a digital product bundle (title, descriptions, tags, attributes, SEO keywords) and write **`metadata.json`**.

No publishing. No Etsy API. No Dashboard.

## Architecture

```
Bundle + Style Guide + Poster list
        ↓
ProductMetadataGenerator (apps orchestration / I/O)
        ↓
CreativeDirector.createProductMetadata
        ↓
LLMCreativeDirector → LLMProvider (purpose: product-metadata)
        ↓
metadata.json  (marketplace-agnostic)
```

## Implemented

1. Domain **`ProductMetadata`** + `parseProductMetadata` (exactly **13** Etsy tags)
2. **`CreativeDirector.createProductMetadata`** — LLM only through CreativeDirector
3. Domain **`FakeCreativeDirector`** mock for unit tests
4. Infrastructure **`LLMCreativeDirector`** purpose `product-metadata`
5. Apps **`ProductMetadataGenerator`** — loads bundle/style guide/posters, writes `metadata.json`
6. CLI: `npm run generate-metadata -- output/ocean [--paper A4|US_LETTER]`

## Files

| Path                                                            | Purpose                           |
| --------------------------------------------------------------- | --------------------------------- |
| `packages/domain/src/creative/product-metadata.ts`              | ProductMetadata contract + parser |
| `packages/domain/src/creative/creative-director.ts`             | createProductMetadata on port     |
| `packages/domain/src/creative/fake-creative-director.ts`        | Test fake                         |
| `packages/infrastructure/src/creative/llm-creative-director.ts` | LLM-backed metadata               |
| `apps/api/src/bundle/generate-metadata.ts`                      | ProductMetadataGenerator          |
| `apps/api/src/cli/generate-metadata.ts`                         | CLI                               |
| `tests/api/product-metadata.test.ts`                            | Unit tests                        |
| `PRODUCT_SPRINT_4.md`                                           | This report                       |

## Tests

- FakeCreativeDirector metadata shape (13 tags)
- LLMCreativeDirector via FakeLLMProvider (`product-metadata` purpose)
- ProductMetadataGenerator writes `metadata.json` with mocked CreativeDirector
- Poster list from `posters/<paper>/` or illustration fallback
- `parseProductMetadata` rejects wrong tag counts

Run: `npm test`

## Explicit non-goals

Publishing, Etsy API, Marketplace adapters, Dashboard, Assembler/QA redesign, PDF/ZIP.

## Self-review

### Multi-marketplace reuse without regenerating

`metadata.json` is **channel-agnostic**: one commercial object for the pack.

| Field                             | Etsy                         | Gumroad                      | Creative Market        |
| --------------------------------- | ---------------------------- | ---------------------------- | ---------------------- |
| `title`                           | Listing title                | Product name                 | Product title          |
| `shortDescription`                | Preview / subtitle           | Short blurb                  | Short description      |
| `longDescription`                 | Listing description          | Product description          | Long description       |
| `tags` (13)                       | Etsy tags (use all 13)       | Tags / keywords (subset OK)  | Keywords (subset OK)   |
| `materials`                       | Materials attribute          | Optional product details     | File / asset notes     |
| `primaryColor` / `secondaryColor` | Color attributes             | Storefront accents / filters | Category filters       |
| `occasion` / `room` / `ageGroup`  | Etsy attributes              | Optional facets              | Audience / use filters |
| `seoKeywords`                     | Title/description SEO assist | SEO / discoverability        | Search keywords        |

Later **Publisher / Marketplace adapters** map the same file to each channel’s API or form fields. Generation stays in CreativeDirector; channels do not re-prompt or rewrite copy unless a human edits the file.

### Why CreativeDirector owns metadata

Listing copy must stay consistent with Style Guide + subjects + posters. Extending CreativeDirector keeps one creative authority; ProductMetadataGenerator stays thin I/O. Swap Fake ↔ LLM directors without changing the generator or future marketplace adapters.
