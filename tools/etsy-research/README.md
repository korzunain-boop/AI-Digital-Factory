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

Debug search scraping:

```bash
npm run research-search -- "educational posters" --debug
```

Debug prints page title, URL, listing-card count, selector used, and anti-bot status.  
If zero listings are found (or an anti-bot page is shown), the tool writes `tools/etsy-research/output/debug.html`.

## Root cause (search returned Listings: 0)

Playwright **did launch and navigate successfully**, but Etsy served a **DataDome CAPTCHA interstitial** instead of search results.

Symptoms of the blocked page:

- `<title>etsy.com</title>` (not a real results title)
- Tiny HTML (~1.5KB) with `captcha-delivery.com` / DataDome iframe
- **Zero** `a[href*="/listing/"]` nodes — there was nothing for the old scraper to collect

The previous scraper waited ~1s then queried listing anchors. On a CAPTCHA shell that correctly returned `[]`, so the CLI printed `Listings: 0` with no explanation.

### Fix

1. Wait until listing cards render **or** an anti-bot page is detected (not a fixed short sleep).
2. Detect DataDome / Cloudflare / generic challenges and **fail with a clear message** (no silent empty list).
3. Broader URL extraction (listing anchors, `data-listing-id`, JSON-LD `ItemList`, `.v2-listing-card`).
4. `--debug` diagnostics + always save `output/debug.html` when blocked or empty.

Note: automated / datacenter browsers are often blocked by DataDome. A residential IP or commercial research tool (e.g. EverBee) may still be required for reliable live search.

## Tests

```bash
cd tools/etsy-research && npm test
```

Normalization, URL extraction, anti-bot detection, and search-scrape orchestration tests mock Playwright — no live network required.

## Self-review

### Architecture

```
CLI (research | research-search) [--debug]
   ↓
URL classify / search URL build
   ↓
Playwright (Chromium) — listing page or search first page
   ↓
Wait for listings OR anti-bot interstitial
   ↓
Detect anti-bot → clear error + debug.html
   OR extract listing URLs → scrape each listing
   ↓
normalizeListing → EtsyListing JSON
   ↓
tools/etsy-research/output/*.json
```

Pure normalization / URL extraction / anti-bot detection stay unit-testable without a browser.

### Limitations

- Etsy markup and bot defenses change; JSON-LD is preferred but not guaranteed forever.
- DataDome often blocks headless/datacenter automation — this tool reports that clearly now.
- Search flow scrapes each listing on the first page (slow; subject to rate limits / CAPTCHAs).
- No proxies, login, or geo handling.
- Ephemeral CDN image URLs may expire.
- Not a substitute for EverBee niche analytics.

### Future improvements

- Optional residential proxy / persistent browser profile for CAPTCHA-prone environments.
- Optional “search cards only” mode (skip per-listing visits).
- Retry / backoff and polite concurrency limits.
- Delete this tool when a commercial research provider covers the workflow.

## Explicit non-goals

No AI, OpenAI, GPT, image analysis, OCR, database, or AI Factory imports.
