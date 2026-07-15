# Etsy Research Tool (standalone)

Internal developer utility for quickly inspecting Etsy listings.

**Not part of AI Product Factory architecture.**  
Does not integrate with Generator, Pipeline, or ResearchProvider.  
May be deleted if EverBee (or another commercial tool) replaces it.

`PROJECT.md`, `SYSTEM.md`, and `DECISIONS.md` are intentionally untouched.

## Setup

```bash
cd tools/etsy-research
npm install
# postinstall installs Playwright Chromium
```

From repo root (after the tool is installed):

```bash
npm run research -- "https://www.etsy.com/listing/<id>/<slug>"
npm run research -- "https://www.etsy.com/search?q=wall+art"
npm run research-search -- "educational posters"
```

JSON lands in `tools/etsy-research/output/`.

## Tests

```bash
cd tools/etsy-research && npm test
```

Normalization and orchestration tests mock Playwright — no live network required.

## Self-review

### Architecture

```
CLI (research | research-search)
   ↓
URL classify / search URL build
   ↓
Playwright (Chromium) — listing page or search first page
   ↓
Raw scrape (JSON-LD Product preferred, DOM/meta fallback)
   ↓
normalizeListing → EtsyListing JSON
   ↓
tools/etsy-research/output/*.json
```

Pure normalization is isolated from Playwright so it stays unit-testable. Scrapers are injectable for orchestration tests.

### Limitations

- Etsy markup and bot defenses change; JSON-LD is preferred but not guaranteed forever.
- Search flow scrapes each listing on the first page (slow; subject to rate limits / CAPTCHAs).
- No proxies, login, or geo handling.
- Ephemeral CDN image URLs may expire.
- Currency heuristics are best-effort when only symbol text is present.
- Not a substitute for EverBee niche analytics.

### Future improvements

- Optional “search cards only” mode (skip per-listing visits).
- Retry / backoff and polite concurrency limits.
- Snapshot HTML fixtures for scraper regression tests.
- CSV export beside JSON.
- Delete this tool when a commercial research provider covers the workflow.

## Explicit non-goals

No AI, OpenAI, GPT, image analysis, OCR, database, or AI Factory imports.
