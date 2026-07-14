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
2. **Ship a thinner MVP**: **First Commercial Generator** → assemblable listing package → export → manual upload → operator dashboard for jobs only.
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
- Multiple generator strategies in MVP (interfaces only beyond the **First Commercial Generator**).
- Hardcoding a permanent product category (e.g. Clipart) into the architecture.
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

## MVP Philosophy (money filter)

**Every feature added to the roadmap must answer:**

> Does this increase the probability of earning money within the next 1–3 months?

- If **Yes** → it may stay on the active roadmap.  
- If **No** → it moves to the **backlog**.  

This rule has **higher priority than technical elegance**. Architecture seams are allowed; implementing non-revenue features behind those seams is not—until Commercial Validation justifies them.

---

## MVP

### MVP definition (business)

A single operator can:

1. Ingest **research** from **manual ideas, CSV, or external tools (e.g. EverBee)**—no own Research Agent.
2. Run **one** strategy: the **First Commercial Generator** (selected after niche validation—not a permanent architectural constant).
3. Run **Assembler** to package assets into a **listing export package** (ZIP, previews, metadata).
4. Run **lightweight QA** on the **finished package**.
5. Use **Publisher in Export mode** to produce an upload-ready folder/ZIP (manual marketplace upload).
6. Operate from a **minimal dashboard**: products, queue, running jobs, generation history, job status.
7. Pass a **Commercial Validation** checkpoint (batch listings + marketplace signals) before expanding the platform.

MVP success = **listing packages uploaded and measurable interest/sales**, not codebase completeness.

### First Commercial Generator

The architecture implements **exactly one** generator strategy for the first commercial push. That strategy is called the **First Commercial Generator**.

| Rule | Detail |
|------|--------|
| What it is | The first concrete `GeneratorStrategy` wired into the Engine |
| How it is chosen | **After validating the niche** (external research / own ideas)—a **business decision** |
| What it is not | A permanent architectural constraint or forever-hardcoded product category |
| Engine impact | None beyond registering one strategy; Engine stays product-agnostic |
| Likely first pick | **Clipart remains a strong candidate** for speed, cost, and ZIP-friendly packaging—but only if niche research says so. Alternatives (Coloring Book, Planner, etc.) win if research shows better near-term money. |

All other product types remain **interfaces / future strategies only** until Commercial Validation (and unit economics) justify them.

### MVP technical shape

| Area | MVP choice |
|------|------------|
| Research | Interface + **external/manual default**: manual ideas, CSV import, optional EverBee (or similar) import. **No AI Research Agent.** |
| Generator Engine | Heart of system; product-agnostic registry; executes strategies only |
| First strategy | **First Commercial Generator** (chosen post niche validation; may be Clipart as a business pick) |
| Generator Templates | Minimal template params for that strategy—data-driven knobs, not a full CMS |
| Assembler | ZIP, preview images, metadata package; PDF only if a listing truly needs it |
| QA | Rule-based on **assembled** output |
| Publisher | **Export listing package mode only** |
| Dashboard | Operations only (see FR-8) |
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
- Continuing feature buildout before **Commercial Validation** passes  

---

## Future Roadmap

Reorganized around **business value**. Do not implement a later phase until the previous one unblocks revenue or reduces operator pain that blocks revenue.

Apply the **money filter** (MVP Philosophy) to every phase.

```
Foundation
    ↓
Architecture Review
    ↓
Generator Engine
    ↓
First Commercial Generator
    ↓
Assembler
    ↓
Minimal Dashboard
    ↓
QA
    ↓
Export Publisher
    ↓
Generate 20–50 products
    ↓
Publish manually
    ↓
Collect marketplace data
    ↓
Commercial Validation
    ↓
Continue development only if hypothesis shows positive signals
    ↓
Analytics
    ↓
Marketplace automation
    ↓
More generators / templates
    ↓
Research Agent   ← among the LAST phases
```

**If Commercial Validation fails:** pivot the **product category** (replace/swap the First Commercial Generator strategy). **Do not** pivot or rewrite the architecture.

### Phase 0 — Foundation

- `PROJECT.md`, `DECISIONS.md`
- Later: repo layout, env conventions, milestone checklist (when coding starts)

**Exit:** docs ready for Architecture Review.

### Phase 0.5 — Architecture Review (mandatory)

- Freeze interfaces before implementation begins: Generation Request / Result, Strategy contract, Research Brief, Asset Bundle, Product Package, Publisher modes.
- Confirm Generator Engine remains product-agnostic.
- Confirm First Commercial Generator selection process (business/niche validation), not a hardcoded forever category in code contracts.

**Exit:** Architecture Review **approved**.  
**Gate:** **No feature work starts before Architecture Review is approved.**

### Phase 1 — Generator Engine

- Core engine: receive Generation Requests → select Strategy → execute → return Generation Results
- Registry/seam only—**no product-specific logic in the Engine**

**Exit:** Engine can invoke a registered strategy and return results without knowing product categories.

### Phase 2 — First Commercial Generator

- Implement **one** strategy chosen after niche validation (Clipart is a candidate business pick, not an architectural mandate)
- Thin Generator Template config for that strategy
- Raw assets only—no packaging here
- All Clipart/Planner/ColoringBook/etc. logic lives **only** inside the chosen strategy (and its templates)

**Exit:** repeatable asset sets for the chosen category from a Research Brief + template params.

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

### Phase 6.5 — Batch listing & marketplace learning (pre-validation)

1. **Generate 20–50 products** through the pipeline.  
2. **Publish manually** via export packages.  
3. **Collect marketplace data** (views, favorites, sales, feedback)—spreadsheet / marketplace UI is enough.

**Exit:** enough real listings and signals to judge the hypothesis.

### Phase 6.6 — Commercial Validation (mandatory gate)

- Decide whether the First Commercial Generator hypothesis shows **positive signals** (engagement and/or revenue relative to cost).
- **Pass:** continue roadmap (Analytics, automation, more generators, etc.).  
- **Fail:** **pivot the product category** (new strategy / niche)—**not** the architecture. Re-enter at Phase 2 with a new First Commercial Generator as needed; keep Engine, Assembler, Export contracts.

**Exit:** explicit go / pivot decision documented (ideally in `DECISIONS.md`).

### Phase 7 — Analytics

- Only after Commercial Validation passes (or strongly positive early signals)
- Revenue ingest (CSV / marketplace export)
- Dashboard: revenue, marketplace statistics
- Inform next Research Briefs manually

**Exit:** “what to generate next” guided by numbers, not vibes alone.

### Phase 8 — Marketplace automation

- Publisher **Publish mode** for one marketplace when APIs/ToS allow
- Then expand adapters: Etsy, Gumroad, Creative Market, Shopify, Ko-fi—as demand justifies

**Exit:** optional automated listing for validated channels; export mode remains forever as fallback.

### Phase 9 — Expansion generators & deeper templates

- Second strategy only if unit economics and validation justify it
- Richer template composition where relevant (e.g. AnimalTemplate → OceanTheme → AgeBand)

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
- Produce a normalized **Research Brief** consumed downstream (feeds Generation Requests).
- Interchangeable **Research Provider** interface.
- **Do not** plan or staff an own AI Research Agent in early phases. It is a **late** optional provider after business validation (Phase 10).
- Manual ingest path must always work even if paid research tools are cancelled.
- Niche validation for choosing the First Commercial Generator happens here (human + tools)—before treating a category as settled.

### FR-2 Generator Engine (core)

- Heart of the project. **Product-agnostic.**
- The Engine must **never** know product details and must **never** contain Clipart-specific, Planner-specific, ColoringBook-specific, or any other category-specific logic.
- Engine responsibilities **only**:
  1. Receive **Generation Requests**
  2. Select the proper **Generator Strategy**
  3. Execute it
  4. Return **Generation Results**
- Strategies register here; category logic lives **exclusively inside Generator Strategies** (+ their templates).
- MVP: register **First Commercial Generator** only.
- Future strategies (interfaces only until justified): Coloring Book, Planner, Printable Game, Flashcard, Clipart (if not chosen first), etc.
- **Strategies produce assets only**—not ZIPs, listing folders, or final PDFs.
- Generation Results / Asset Bundles are consumed by Assembler.

### FR-2b Generator Templates

- Strategies compose **reusable, data-driven templates** instead of hardcoding every niche.
- Conceptual stack example (e.g. for a future or chosen Coloring Book strategy):

  ```
  ColoringBookGenerator
      → AnimalTemplate
          → OceanTheme
              → Age 5–7
                  → Generated Product
  ```

- MVP: enough template parameters for the First Commercial Generator. Avoid building a full template CMS before Commercial Validation.

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

### FR-6 Analytics (post-MVP / post-validation)

- Generation history / job outcomes are operational (MVP via dashboard history).
- Revenue and marketplace statistics: **Phase 7**, after Commercial Validation—not MVP.
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

**Not MVP:** revenue analytics, marketplace analytics, advanced charts. Those move to Phase 7 (after Commercial Validation).

Operator-friendly: clear statuses, start/retry without CLI. Modern AI SaaS look is fine for later polish; MVP prioritizes operability.

### FR-9 Modularity for Cursor

- One module per milestone where possible.
- Interface-first: Research, Generator strategies/templates, Assembler, QA, Publisher modes.
- Engine interfaces frozen at Architecture Review before feature work.

### FR-10 Commercial Validation

- After Export Publisher works: generate 20–50 products, publish manually, collect marketplace data, then run the Commercial Validation gate.
- Fail → pivot category/strategy; keep architecture.

---

## Non Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | **Low monthly cost** — cheap host; no always-on GPU; external research tools only as needed |
| NFR-2 | **MVP first** — one First Commercial Generator, export publisher, ops dashboard |
| NFR-3 | **Modular** — swap Research provider or Publisher mode without rewriting Generator Engine |
| NFR-4 | **Easy expansion** — new generator = strategy + templates; Engine stays untouched for product logic |
| NFR-5 | **Operator reliability** — visible, retryable failures |
| NFR-6 | **Light observability** — logs + job status; no heavy APM initially |
| NFR-7 | **Secrets hygiene** — tokens in env; never committed |
| NFR-8 | **Cursor-friendly** — milestone-sized tasks |
| NFR-9 | **Time-to-money** — listing package in operator hands ASAP |
| NFR-10 | **Boring over clever** — revenue-facing simplicity wins |
| NFR-11 | **Money filter** — roadmap features must raise P(revenue in 1–3 months) or go to backlog |

---

## Architectural Principles

1. **Money over elegance** — ship sellable packages sooner. Money filter outranks elegance.
2. **Business validation before automation** — listings and sales before Research Agent or publish APIs.
3. **Commercial Validation before expansion** — batch list, measure, then continue or pivot category.
4. **Generator Engine is the heart** — product-agnostic; strategies orbit the Engine.
5. **Engine never knows product details** — only Request → select Strategy → execute → Result.
6. **Generators make assets; Assembler makes products** — hard boundary.
7. **QA validates finished products** — after Assembler.
8. **Strategy + Templates** — strategies for product types; templates for niche/theme data.
9. **First Commercial Generator is a business choice** — may be Clipart; not an architectural constant.
10. **Research is interchangeable; default is external/manual** — own AI Research is late.
11. **Publisher: export first, automate later** — APIs are a luxury.
12. **Dashboard is an operations console in MVP** — analytics wait.
13. **Pipeline stages are independently retryable.**
14. **Cost is a feature** — rough cost per job when practical; kill expensive non-converting paths.
15. **Cursor never builds the whole app at once.**
16. **Architecture Review freezes interfaces** before feature implementation.
17. **Replace internals, keep contracts** — especially Request/Result, Research Brief, Product Package.
18. **Marketplace ToS / IP risk is a product constraint** — not an afterthought.

---

## Success Metrics

### Business (1–3 months) — primary

| Metric | Target guidance |
|--------|-----------------|
| Export packages created | First upload-ready pack ASAP |
| Batch for validation | 20–50 products generated and manually listed |
| Marketplace engagement | Favorites/views on at least one niche |
| Revenue | Non-zero; then covers platform + generation cost |
| Commercial Validation | Explicit pass/pivot decision |
| Operator time brief → upload | Shrinks each week |
| Cost per pack | Well below expected ASP × realistic conversion |

### System — secondary

| Metric | Guidance |
|--------|----------|
| Assemble+QA pass rate | Most packages need no hand surgery |
| Retry clarity | Failures are actionable |
| Engine purity | No category-specific logic in Engine |
| Adding a second generator later | Does not rewrite Engine / Assembler / Publisher |

**North star:** profitable packages shipped. Not agent sophistication. Not dashboard vanity charts.

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Products nobody wants | High | External research + Commercial Validation; pivot category not architecture |
| Overbuilding before first sale | High | Hard MVP cuts; money filter; Architecture Review scope freeze |
| Wrong First Commercial Generator | High | Niche validation before implementing strategy; Clipart is a candidate not a destiny |
| Category quality / sameness | High | Templates + human spot-check; tight niche briefs |
| API/generation cost > revenue | High | Small packs; cheap models; stop losers at validation gate |
| Marketplace API illusion | Medium | Export mode is the real MVP path |
| Template system overbuilt | Medium | Flat params until validation passes |
| Assembler as mini-Canva | Medium | Only ZIP/preview/metadata/PDF-as-needed |
| EverBee/tool dependency | Medium | Always keep CSV/manual provider |
| Legal / trademark niches | High | Ban brand IP; document provenance |
| Cursor scope sprawl | Medium | Milestones + this doc + DECISIONS.md |
| Skipping Commercial Validation | High | Mandatory gate before Analytics / automation / more generators |

---

## Business Validation Strategy

### Principle

**Do not automate what you have not validated.**  
Validation = marketplace evidence (demand, competition, listings, early sales)—not a working agent demo.

### Default research workflow

1. Operator uses **EverBee / keyword tools / own ideas / CSV** to pick niche + category for the First Commercial Generator.  
2. Brief enters the factory.  
3. **First Commercial Generator** → Assembler → QA → **Export**.  
4. Human uploads listings.  
5. Generate **20–50** products; collect marketplace data outside the app until Phase 7.  
6. **Commercial Validation** → scale, pivot category, or kill.  
7. **Only much later:** Research Agent and marketplace publish automation.

### Validation gates

| Gate | Question | Fail action |
|------|----------|-------------|
| Niche gate | Proven demand / workable competition for the chosen category? | Don’t implement / don’t batch-generate |
| Architecture Review | Interfaces frozen and approved? | No feature work |
| Strategy quality gate | Pack looks sellable after Assembler? | Fix strategy/templates before queueing dozens |
| Channel gate | Manual upload path works? | Stay on export; don’t chase APIs |
| Unit economics | Cost per pack << realistic expected return? | Shrink pack or change niche/model |
| **Commercial Validation** | 20–50 listings show positive signals? | **Pivot product category**, keep architecture |
| Automation gate | Does volume justify publish API or Research Agent? | Keep export + external research |

---

## Cursor Development Doctrine

1. One milestone = one narrow outcome.  
2. **Never** generate the entire application in one Cursor pass.  
3. Suggested coding order (when coding starts)—aligned to roadmap:

   1. Foundation / skeleton  
   2. **Architecture Review (approve interfaces)—blocking**  
   3. Generator Engine (product-agnostic)  
   4. First Commercial Generator + minimal templates  
   5. Assembler (ZIP, previews, metadata)  
   6. Minimal ops dashboard  
   7. QA on packages  
   8. Export Publisher  
   9. Batch 20–50 → manual publish → collect data → **Commercial Validation**  
   10. Analytics (only if validation passes)  
   11. Marketplace publish mode (later)  
   12. More generators (later)  
   13. Research Agent provider (last)  

4. Keep `PROJECT.md` and `DECISIONS.md` updated when decisions change.
5. Apply the **money filter** before starting any milestone.

---

## Critical Review (hostile pass)

This section intentionally challenges the architecture. Goal: raise P(revenue in 1–3 months), not protect elegance.

### Biggest risks

1. **Building a “platform” when a script + spreadsheet might sell first.** Interfaces, registry, dashboard, and job state machines can burn weeks before a single marketplace upload.  
2. **Treating any first category as destiny.** Even a strong candidate (e.g. Clipart) can fail; validation must allow category pivot.  
3. **External research quality still depends on the human.** EverBee + CSV does not remove niche selection skill; the factory can accelerate producing junk.  
4. **Assembler scope creep.** Preview generation and “metadata package” can become a design tool. That delay kills the export timeline.  
5. **Pipeline ceremony.** Five stages (Research → Generator → Assembler → QA → Publisher) may be more moving parts than needed for one operator shipping ZIP files.
6. **Skipping Commercial Validation** and “just continuing” into analytics/automation.

### Unnecessary complexity (likely)

- Full Strategy registry ceremony beyond what one First Commercial Generator needs day one.  
- Deep template composition graphs before validation—flat YAML/JSON params are enough.  
- Job orchestration and retries for a solo operator who could run a CLI twice a day.  
- “Modern AI SaaS” dashboard aesthetics before the export path is boringly reliable.  
- Multiple Publisher mode abstractions before Export is used daily.

### Features that should probably be removed or deferred harder

- Any early work on Gumroad/Shopify/Ko-fi adapters.  
- Revenue charts before Commercial Validation.  
- PDF generation until the chosen product type requires it.  
- LLM-based QA until rule checks fail often enough to hurt.  
- Multi-tenant auth, roles, billing—never near MVP.  
- Cost-metering precision (good idea, easy rabbit hole).

### Elegant decisions unlikely to improve early revenue

| Decision | Critique |
|----------|----------|
| Heavy adapter purity for Research | A `briefs/` folder of JSON may beat a provider framework until tools stabilize. |
| Separate Assembler module | Correct separation—but could start as functions inside an “export” script to ship faster, then split when a second generator arrives. |
| Formal QA stage | Early on, opening the ZIP and looking may beat building a QA engine. Automate only after you’ve seen repeated failure modes. |
| Generator Templates as a layer | Valuable later; risky if it becomes a mini product before Commercial Validation. |
| Keeping marketplace Publish mode in the design | Fine as a one-paragraph interface note; dangerous if any code is written for it pre-revenue. |
| Analytics phase before validated sales | Spreadsheets are enough until pain is real. |

### Architect’s honest compression advice

If schedule slips, collapse toward:

**CSV brief → First Commercial Generator → zip+previews script → manual upload → sheet of results → Commercial Validation.**

Re-introduce Engine registry polish, dashboard, QA module, and providers only when that loop is making money or clearly bottlenecked—or after Architecture Review explicitly says the interfaces are worth the ceremony.

The documents keep modular seams so expansion stays cheap—but **seams are not a license to implement every seam on day one.**

---

## Document Status

| Field | Value |
|-------|--------|
| Documents | `PROJECT.md`, `DECISIONS.md` |
| Project | AI Product Factory |
| Phase | Architecture / product brief only |
| Code | **None** — intentionally |
| First strategy | **First Commercial Generator** (business choice after niche validation; Clipart is a candidate) |
| Publisher MVP | **Export listing package** |
| Research default | External / manual / CSV — **not** own AI agent |
| Hard gate | Architecture Review before feature work; Commercial Validation before expansion |
| Next step | Foundation → Architecture Review → Engine → First Commercial Generator milestones |

---

*Constitution for AI Product Factory. Defer to: product-agnostic Generator Engine at the center, Assembler for packaging, export-first publishing, external research by default, ops-only MVP dashboard, one First Commercial Generator chosen by business validation, Architecture Review before code features, Commercial Validation before expansion—optimized for profitable products in 1–3 months. See `DECISIONS.md` for the decision log.*
