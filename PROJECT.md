# AI Product Factory

> Architecture & product brief. **No implementation yet.**  
> Companion: [`DECISIONS.md`](./DECISIONS.md) — major architectural decisions, tradeoffs, and reconsideration triggers.  
> Single source of truth for vision and scope. Build with Cursor—one small milestone at a time.

---

## Product Vision

**AI Product Factory** is a lean platform that turns marketplace demand signals into sellable digital products—fast.

We do not optimize for “the smartest AI agents.” We optimize for **speed to revenue**: take an external or manual research brief, generate assets, assemble a listing package, QA it, export (or later publish) it, and learn what sells.

The factory pipeline:

```
Research → Generator → Assembler → QA → Publisher
```

Analytics and marketplace automation are **post-MVP**.

The **Generator Engine** is the heart of the system. Everything else—research providers, templates, assembler, QA, publisher modes—exists to feed it sellable briefs and ship its output. The business goal for the first 1–3 months: **produce and list profitable digital products** with minimal monthly cost and maximum learning loops.

---

## Goals

1. **Validate ideas with real marketplace listings**, not demos or toy agents.
2. **Ship a thinner MVP**: one generator → assemblable listing package → export → manual upload → operator dashboard for jobs only.
3. **Keep monthly infra/API costs low** enough that early revenue can cover operations.
4. **Keep Research and Publisher as interfaces** so providers/modes swap without rewriting the Generator Engine.
5. **Make future generators addable** via Strategy Pattern + reusable Generator Templates (data-driven where possible).
6. **Operator dashboard for operations** (products, queue, jobs, history)—not analytics theater.
7. **Develop in tiny Cursor-friendly milestones**—never generate the whole app in one pass.
8. **Optimize for money in 1–3 months**, not architectural purity.

---

## Non Goals

Explicitly **out of scope** for MVP and early phases:

- Building an own **AI Research Agent** (future provider only, after validation—see roadmap).
- Marketplace **publishing automation** in MVP (export package first).
- Revenue / marketplace analytics dashboards in MVP.
- Multiple generator strategies in MVP (interfaces only beyond the one chosen).
- Supporting all marketplaces on day one.
- The most capable/general multi-agent system.
- Perfect ML/eval frameworks, heavy MLOps, or GPU clusters.
- Mobile apps, public multi-tenant SaaS, or our own marketplace.
- Real-time collaboration, complex RBAC, or enterprise SSO.
- Full creative-suite replacement (Canva/Photoshop).
- Legal/tax/accounting automation.
- Pixel-perfect design systems beyond a usable operational dashboard.
- Auto ads, influencer engines, or social managers.

---

## MVP

### MVP definition (business)

A single operator can:

1. Ingest **research** from **manual ideas, CSV, or external tools (e.g. EverBee)**—no own Research Agent.
2. Run **one generator strategy only: Clipart Generator** (see rationale below).
3. Run **Assembler** to package assets into a **listing export package** (ZIP, previews, metadata).
4. Run **lightweight QA** on the **finished package**.
5. Use **Publisher in Export mode** to produce an upload-ready folder/ZIP (manual marketplace upload).
6. Operate from a **minimal dashboard**: products, queue, running jobs, generation history, job status.

MVP success = **listing packages uploaded and measurable interest/sales**, not codebase completeness.

### Why Clipart Generator (only MVP strategy)

| Criterion | Why Clipart wins for 1–3 months |
|-----------|----------------------------------|
| Demand | Digital clipart / illustration packs are a proven high-volume digital category on marketplaces (esp. Etsy-style SEO niches). |
| Speed | Assets are independent images; iterate niches without multi-page layout logic. |
| Cost | Fewer “layout failures”; pay mainly for image generation, not PDF redesign loops. |
| Assembler fit | ZIP + preview collage + metadata is enough to list; PDF is optional later. |
| Validation | Many niche/theme variants from the same templates → faster A/B of niches. |
| Complexity | Lower than Coloring Books (PDF/print constraints), Planners (calendar logic), Games (rules/UX). |

**Everything else** (Coloring Book, Planner, Printable Game, Flashcard) remains **interfaces / future strategies only**.

### MVP technical shape

| Area | MVP choice |
|------|------------|
| Research | Interface + **external/manual default**: manual ideas, CSV import, optional EverBee (or similar) import. **No AI Research Agent.** |
| Generator Engine | Heart of system; registry; **one** strategy: Clipart |
| Generator Templates | Minimal template layer for Clipart (e.g. theme + style + pack size)—data-driven knobs, not a full CMS |
| Assembler | ZIP, preview images, metadata package; PDF only if a listing truly needs it |
| QA | Rule-based on **assembled** output |
| Publisher | **Export listing package mode only** |
| Dashboard | Operations only (see FR-7) |
| Analytics | **Not MVP** — spreadsheet / marketplace UI is fine |
| Hosting | Cheapest workable single app + DB |
| Auth | Single operator / simple login |

### What MVP deliberately skips

- Marketplace API publishing automation  
- Revenue / marketplace analytics UI  
- Second generator strategy  
- Own AI Research Agent  
- Multi-marketplace matrix  
- Fancy SaaS marketing shell  

---

## Future Roadmap

Reorganized around **business value**. Do not implement a later phase until the previous one unblocks revenue or reduces operator pain that blocks revenue.

```
Foundation
    ↓
Generator Engine
    ↓
One Generator (Clipart)
    ↓
Assembler
    ↓
Minimal Dashboard
    ↓
QA
    ↓
Export Publisher
    ↓
Analytics
    ↓
Marketplace automation
    ↓
More generators / templates
    ↓
Research Agent   ← among the LAST phases
```

### Phase 0 — Foundation

- `PROJECT.md`, `DECISIONS.md`
- Later: repo layout, env conventions, milestone checklist (when coding starts)

**Exit:** docs approved; coding starts as separate Cursor tasks.

### Phase 1 — Generator Engine

- Core engine interface, registry, job handoff contracts
- No need for every future strategy—just the seam that Clipart plugs into

**Exit:** Engine can invoke a registered strategy and return raw assets.

### Phase 2 — One Generator (Clipart)

- Clipart Strategy + thin Generator Template config (theme/style/count)
- Raw assets only—no packaging here

**Exit:** repeatable clipart asset sets from a Research Brief + template params.

### Phase 3 — Assembler

- Package files, ZIP, preview images, metadata package
- PDF only if required for the chosen listing format

**Exit:** folder/ZIP that a human can upload as a digital product.

### Phase 4 — Minimal Dashboard

- Products, Queue, Running Jobs, Generation History, Job Status
- Start / retry jobs; show failures clearly
- **No** revenue charts, marketplace analytics, or advanced charts

**Exit:** operator runs the factory from UI without CLI archaeology.

### Phase 5 — QA

- Validate **finished** packages (Assembler output)
- Hard fail vs warn; persist reports

**Exit:** bad packages blocked from export; good ones marked ready.

### Phase 6 — Export Publisher

- Publisher **Export mode**: listing package ready for manual upload
- Marketplace Publishing mode: **interface stub only**

**Exit:** one-click (or one-command) export of QA-passed products.

### Phase 7 — Analytics

- Revenue ingest (CSV / marketplace export)
- Dashboard: revenue, marketplace statistics
- Inform next Research Briefs manually

**Exit:** “what to generate next” guided by numbers, not vibes alone.

### Phase 8 — Marketplace automation

- Publisher **Publish mode** for one marketplace when APIs/ToS allow
- Then expand adapters: Etsy, Gumroad, Creative Market, Shopify, Ko-fi—as demand justifies

**Exit:** optional automated listing for validated channels; export mode remains forever as fallback.

### Phase 9 — Expansion generators & deeper templates

- Second strategy (e.g. Coloring Book) if Clipart unit economics work
- Richer template composition (AnimalTemplate → OceanTheme → AgeBand-style stacks where relevant)

**Exit:** new product types without rewriting Engine / Assembler / Publisher contracts.

### Phase 10 — Research Agent (LATE)

- Own AI Research Agent as **another Research Provider**
- Same Research Brief contract as EverBee / CSV / manual
- Only after revenue and when external research throughput/cost is the real bottleneck

**Exit:** research provider swapped without touching Generator Engine, Assembler, QA, or Publisher.

---

## Functional Requirements

### FR-1 Research

- **Default workflow:** external research and human input—EverBee (or similar), manual ideas, CSV import.
- Produce a normalized **Research Brief** for the Generator Engine.
- Interchangeable **Research Provider** interface.
- **Do not** plan or staff an own AI Research Agent in early phases. It is a **late** optional provider after business validation (Phase 10).
- Manual ingest path must always work even if paid research tools are cancelled.

### FR-2 Generator Engine (core)

- Heart of the project. Strategies register here.
- MVP: **Clipart Generator** only.
- Future strategies (interfaces only for now): Coloring Book, Planner, Printable Game, Flashcard.
- **Generators produce assets only**—not ZIPs, listing folders, or final PDFs.
- Output: raw **Asset Bundle** consumed by Assembler.

### FR-2b Generator Templates

- Generators compose **reusable, data-driven templates** instead of hardcoding every niche.
- Conceptual stack example (future Coloring Book; Clipart uses a flatter variant early):

  ```
  ColoringBookGenerator
      → AnimalTemplate
          → OceanTheme
              → Age 5–7
                  → Generated Product
  ```

- MVP: enough template parameters for Clipart niche packs (theme, style, asset count, naming patterns). Avoid building a full template CMS before first sales.

### FR-3 Assembler

- Sits between Generator and QA.
- Responsibilities:
  - Package files
  - Create ZIP
  - Create preview images
  - Generate metadata package (title, tags, description drafts, file manifest)
  - Generate PDFs **if required**
- Input: Asset Bundle (+ brief/template metadata). Output: **Product Package**.

### FR-4 QA

- Validates **finished Product Packages** (post-Assembler), not raw generator scraps.
- File presence, formats, sizes, counts, metadata completeness.
- Block export on hard failures; warn on soft issues.
- Persist QA reports linked to jobs.

### FR-5 Publisher

- Two modes behind one module:
  1. **Export listing package** — MVP; default.
  2. **Marketplace publishing** — Phase 8+; interface early, implement later.
- Future marketplace adapters: Etsy, Gumroad, Creative Market, Shopify, Ko-fi.
- Never assume API automation will unblock MVP.

### FR-6 Analytics (post-MVP)

- Generation history / job outcomes are operational (MVP via dashboard history).
- Revenue and marketplace statistics: **Phase 7**, not MVP.
- Later: feed insights into the next human Research Brief.

### FR-7 Pipeline / Jobs

```
Research → Generator → Assembler → QA → Publisher
```

- Job states: `pending`, `running`, `succeeded`, `failed`, `cancelled`.
- Allow re-run from a failed stage (e.g. re-Assemble without regenerating assets when possible).

### FR-8 Dashboard (MVP = operations)

**MVP must show:**

- Products  
- Queue  
- Running Jobs  
- Generation History  
- Job Status  

**Not MVP:** revenue analytics, marketplace analytics, advanced charts. Those move to Phase 7.

Operator-friendly: clear statuses, start/retry without CLI. Modern AI SaaS look is fine for later polish; MVP prioritizes operability.

### FR-9 Modularity for Cursor

- One module per milestone where possible.
- Interface-first: Research, Generator strategies/templates, Assembler, QA, Publisher modes.

---

## Non Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | **Low monthly cost** — cheap host; no always-on GPU; external research tools only as needed |
| NFR-2 | **MVP first** — one generator, export publisher, ops dashboard |
| NFR-3 | **Modular** — swap Research provider or Publisher mode without rewriting Generator Engine |
| NFR-4 | **Easy expansion** — new generator = strategy + templates; Assembler/QA/Publisher unchanged where possible |
| NFR-5 | **Operator reliability** — visible, retryable failures |
| NFR-6 | **Light observability** — logs + job status; no heavy APM initially |
| NFR-7 | **Secrets hygiene** — tokens in env; never committed |
| NFR-8 | **Cursor-friendly** — milestone-sized tasks |
| NFR-9 | **Time-to-money** — listing package in operator hands ASAP |
| NFR-10 | **Boring over clever** — revenue-facing simplicity wins |

---

## Architectural Principles

1. **Money over elegance** — ship sellable packages sooner.
2. **Business validation before automation** — listings and sales before Research Agent or publish APIs.
3. **Generator Engine is the heart** — all product types and templates orbit the Engine.
4. **Generators make assets; Assembler makes products** — hard boundary.
5. **QA validates finished products** — after Assembler.
6. **Strategy + Templates** — strategies for product types; templates for niche/theme data.
7. **Research is interchangeable; default is external/manual** — own AI Research is late.
8. **Publisher: export first, automate later** — APIs are a luxury.
9. **Dashboard is an operations console in MVP** — analytics wait.
10. **Pipeline stages are independently retryable.**
11. **Cost is a feature** — rough cost per job when practical; kill expensive non-converting paths.
12. **Cursor never builds the whole app at once.**
13. **Replace internals, keep contracts** — especially Research Brief and Product Package shapes.
14. **Marketplace ToS / IP risk is a product constraint** — not an afterthought.

---

## Success Metrics

### Business (1–3 months) — primary

| Metric | Target guidance |
|--------|-----------------|
| Export packages created | First upload-ready clipart pack ASAP |
| Listings live (manual upload OK) | Steady weekly cadence after first |
| Marketplace engagement | Favorites/views on at least one niche |
| Revenue | Non-zero; then covers platform + generation cost |
| Operator time brief → upload | Shrinks each week |
| Cost per pack | Well below expected ASP × realistic conversion |

### System — secondary

| Metric | Guidance |
|--------|----------|
| Assemble+QA pass rate | Most packages need no hand surgery |
| Retry clarity | Failures are actionable |
| Adding a second generator later | Does not rewrite Assembler/Publisher |

**North star:** profitable packages shipped. Not agent sophistication. Not dashboard vanity charts.

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Products nobody wants | High | External research + kill niches early; don’t scale generation for hobbies |
| Overbuilding before first sale | High | Hard MVP cuts (one generator, export-only, ops dashboard) |
| Clipart quality / sameness | High | Templates + human spot-check; tight niche briefs |
| API/generation cost > revenue | High | Small packs; cheap models; stop losers |
| Marketplace API illusion | Medium | Export mode is the real MVP path |
| Template system overbuilt | Medium | MVP: flat Clipart params; deep composition later |
| Assembler as mini-Canva | Medium | Only ZIP/preview/metadata/PDF-as-needed |
| EverBee/tool dependency | Medium | Always keep CSV/manual provider |
| Legal / trademark niches | High | Ban brand IP; document provenance |
| Cursor scope sprawl | Medium | Milestones + this doc + DECISIONS.md |

---

## Business Validation Strategy

### Principle

**Do not automate what you have not validated.**  
Validation = marketplace evidence (demand, competition, listings, early sales)—not a working agent demo.

### Default research workflow

1. Operator uses **EverBee / keyword tools / own ideas / CSV**.  
2. Brief enters the factory.  
3. Clipart Generator → Assembler → QA → **Export**.  
4. Human uploads listing.  
5. Measure outside the app (marketplace UI / sheet) until Phase 7 Analytics.  
6. Scale winners; kill losers.  
7. **Only much later:** Research Agent and marketplace publish automation.

### Validation gates

| Gate | Question | Fail action |
|------|----------|-------------|
| Niche gate | Proven demand / workable competition? | Don’t batch-generate |
| Clipart quality gate | Pack looks sellable after Assembler? | Fix templates before queueing dozens |
| Channel gate | Manual upload path works? | Stay on export; don’t chase APIs |
| Unit economics | Cost per pack << realistic expected return? | Shrink pack or change niche/model |
| Automation gate | Does volume justify publish API or Research Agent? | Keep export + external research |

---

## Cursor Development Doctrine

1. One milestone = one narrow outcome.  
2. **Never** generate the entire application in one Cursor pass.  
3. Suggested coding order (when coding starts)—aligned to roadmap:

   1. Foundation / skeleton  
   2. Generator Engine interface  
   3. Clipart strategy + minimal templates  
   4. Assembler (ZIP, previews, metadata)  
   5. Minimal ops dashboard  
   6. QA on packages  
   7. Export Publisher  
   8. Analytics (later)  
   9. Marketplace publish mode (later)  
   10. More generators (later)  
   11. Research Agent provider (last)  

4. Keep `PROJECT.md` and `DECISIONS.md` updated when decisions change.

---

## Critical Review (hostile pass)

This section intentionally challenges the architecture. Goal: raise P(revenue in 1–3 months), not protect elegance.

### Biggest risks

1. **Building a “platform” when a script + spreadsheet might sell first.** Interfaces, registry, dashboard, and job state machines can burn weeks before a single Etsy upload.  
2. **Clipart is competitive and taste-sensitive.** “Proven category” ≠ “we will win.” AI clipart can look generic; buyers may prefer premium human packs.  
3. **External research quality still depends on the human.** EverBee + CSV does not remove niche selection skill; the factory can accelerate producing junk.  
4. **Assembler scope creep.** Preview generation and “metadata package” can become a design tool. That delay kills the export timeline.  
5. **Pipeline ceremony.** Five stages (Research → Generator → Assembler → QA → Publisher) may be more moving parts than needed for one operator shipping ZIP files.

### Unnecessary complexity (likely)

- Full Strategy registry before a second generator exists (a single `ClipartGenerator` module may suffice until Phase 9).  
- Deep template composition graphs (Animal → Ocean → Age) for Clipart MVP—flat YAML/JSON params are enough.  
- Job orchestration and retries for a solo operator who could run a CLI twice a day.  
- “Modern AI SaaS” dashboard aesthetics before the export path is boringly reliable.  
- Multiple Publisher mode abstractions before Export is used daily.

### Features that should probably be removed or deferred harder

- Any early work on Gumroad/Shopify/Ko-fi adapters.  
- Revenue charts before 10 live listings.  
- PDF generation until a product type requires it (Clipart often does not).  
- LLM-based QA until rule checks fail often enough to hurt.  
- Multi-tenant auth, roles, billing—never near MVP.  
- Cost-metering precision (good idea, easy rabbit hole).

### Elegant decisions unlikely to improve early revenue

| Decision | Critique |
|----------|----------|
| Heavy adapter purity for Research | A `briefs/` folder of JSON may beat a provider framework until tools stabilize. |
| Separate Assembler module | Correct separation—but could start as functions inside an “export” script to ship faster, then split when a second generator arrives. |
| Formal QA stage | Early on, opening the ZIP and looking may beat building a QA engine. Automate only after you’ve seen repeated failure modes. |
| Generator Templates as a layer | Valuable later; risky if it becomes a mini product before Clipart packs sell. |
| Keeping marketplace Publish mode in the design | Fine as a one-paragraph interface note; dangerous if any code is written for it pre-revenue. |
| Analytics phase in the roadmap at all before consistent sales | Spreadsheets are enough until pain is real. |

### Architect’s honest compression advice

If schedule slips, collapse toward:

**CSV brief → Clipart generate → zip+previews script → manual Etsy upload → sheet of results.**

Re-introduce Engine registry, dashboard, QA module, and providers only when that loop is making money or clearly bottlenecked.

The documents keep modular seams so expansion stays cheap—but **seams are not a license to implement every seam on day one.**

---

## Document Status

| Field | Value |
|-------|--------|
| Documents | `PROJECT.md`, `DECISIONS.md` |
| Project | AI Product Factory |
| Phase | Architecture / product brief only |
| Code | **None** — intentionally |
| MVP generator | **Clipart** only |
| Publisher MVP | **Export listing package** |
| Research default | External / manual / CSV — **not** own AI agent |
| Next step | Execute Foundation → Engine → Clipart milestones as separate Cursor tasks when coding begins |

---

*Constitution for AI Product Factory. Defer to: Generator Engine at the center, Assembler for packaging, export-first publishing, external research by default, ops-only MVP dashboard, one Clipart strategy—optimized for profitable products in 1–3 months. See `DECISIONS.md` for the decision log.*
