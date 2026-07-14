# AI Product Factory

> Architecture & product brief. **No implementation yet.**  
> This document is the single source of truth for vision, scope, and how we build with Cursor—one small milestone at a time.

---

## Product Vision

**AI Product Factory** is a lean platform that turns marketplace demand signals into sellable digital products—fast.

We do not optimize for “the smartest AI agents.” We optimize for **speed to revenue**: research a niche, generate a digital product pack, QA it, publish it to a marketplace, and learn what sells.

The factory is a pipeline:

```
Research → Generator → QA → Publisher → Analytics
```

The **Generator Engine** is the heart of the system. Research, publishing, and analytics are swappable modules around it. The business goal for the first 1–3 months is simple: **produce and list profitable digital products** with minimal monthly cost and maximum learning loops.

---

## Goals

1. **Validate ideas with real marketplace listings**, not demos or toy agents.
2. **Ship an MVP** that can research (or ingest research), generate one product type, QA, and publish to at least one marketplace.
3. **Keep monthly infra/API costs low** enough that early revenue can cover operations.
4. **Use modular adapters** so marketplaces and research providers can be swapped without rewriting the core.
5. **Make generators independently addable** via Strategy Pattern (Clipart, Coloring Books, Planners, etc.).
6. **Expose an operator dashboard** (modern AI SaaS feel) for products, queue, revenue, jobs, and analytics.
7. **Develop in tiny Cursor-friendly milestones**—never generate the whole app in one pass.
8. **Optimize for money in 1–3 months**, not architectural purity.

---

## Non Goals

Explicitly **out of scope** for the early phases:

- Building the most capable/general multi-agent system.
- Supporting all marketplaces on day one.
- Replacing EverBee (or similar) with a custom Research Agent before revenue.
- Perfect ML/eval frameworks, heavy MLOps, or GPU clusters.
- Mobile apps, public multi-tenant SaaS for strangers, or marketplaces of our own.
- Real-time collaboration, complex RBAC, or enterprise SSO.
- Full creative-suite replacement (Canva/Photoshop).
- Legal advice automation, tax filing, or full accounting.
- Pixel-perfect design systems beyond a clean dashboard MVP.
- Auto-optimizing ads, influencer engines, or social media managers.

---

## MVP

### MVP definition (business)

A single operator can:

1. Provide or pull **research input** (manual ideas and/or one external research source).
2. Run **one generator** (e.g. Clipart or Coloring Book) to produce a marketplace-ready digital product pack.
3. Run **lightweight QA** (file presence, format checks, basic content sanity).
4. **Publish** (or prepare a publish package) to **one marketplace** (likely Etsy or Gumroad first).
5. See **status in a dashboard**: queue, running jobs, products, generation history, and basic revenue/stats placeholders.

MVP success = **products listed and measurable interest/sales**, not codebase completeness.

### MVP technical shape

| Area | MVP choice |
|------|------------|
| Research | Adapter interface + 1–2 sources (manual CSV/ideas + optional EverBee-like export/API) |
| Generator | Generator Engine + **one** Strategy (recommend Clipart or Coloring Book—highest digital-product velocity) |
| QA | Rule-based checks; optional cheap LLM spot-check later |
| Publisher | **One** marketplace adapter |
| Analytics | Manual or import (CSV / marketplace export); simple dashboard widgets |
| Hosting | Cheap single app + DB (or serverless) — preference for low fixed cost |
| Auth | Single operator / simple login |
| Cursor work | Sequence of small milestones (see Roadmap) |

### What MVP deliberately skips

- Multi-marketplace publishing matrix  
- Custom AI Research Agent  
- Advanced A/B product variants  
- Full finance/P&L automation  
- Multi-tenant SaaS packaging  

---

## Future Roadmap

Phased so each step can be a Cursor milestone series. Do not implement future phases until the previous phase proves value.

### Phase 0 — Project foundation (docs & skeleton only)

- This `PROJECT.md`
- Later: repo layout, env conventions, milestone checklist (separate docs when coding starts)

### Phase 1 — Vertical slice (money path)

- Generator Engine interface + **one** generator strategy  
- Minimal product model (title, tags, files, status, marketplace ids)  
- Manual or semi-manual research ingest  
- Basic QA  
- One publisher adapter (draft listing or full publish)  
- Bare dashboard: products + job status  

**Exit criteria:** one real listing live or ready-to-upload pack with traceable generation history.

### Phase 2 — Queue, jobs, and operator UX

- Job queue for Research → Generate → QA → Publish  
- Dashboard: queue, running jobs, generation history  
- Failure retries and clear error surfaces  
- Cost meters (API spend rough estimates)  

**Exit criteria:** operator runs multiple products through the pipeline without babysitting each step.

### Phase 3 — Research modularity + second generator

- Formal Research Provider adapter (EverBee / custom import / own ideas)  
- Swap provider without changing Generator/Publisher  
- Second generator strategy (e.g. Planner or Flashcard)  
- Shared asset packaging conventions  

**Exit criteria:** two product types; research source swappable.

### Phase 4 — Multi-marketplace adapters

- Adapter interface stable  
- Additional marketplaces: Etsy, Gumroad, Creative Market, Shopify, Ko-fi (as demand justifies)  
- Per-marketplace listing field mappers and asset constraints  

**Exit criteria:** same product can be published (or packaged) for 2+ marketplaces.

### Phase 5 — Analytics & optimization loop

- Revenue ingest from marketplace exports/APIs  
- Dashboard: revenue, marketplace statistics, conversion proxies  
- Feedback into research (what niches convert)  

**Exit criteria:** decisions on “what to generate next” driven by dashboard data.

### Phase 6 — Own Research Agent (optional replace)

- AI Research Agent as another Research Provider  
- Same interfaces as Phase 3; no rewrites of Generator Engine / Publisher  
- Only if external research cost or quality becomes the bottleneck  

### Phase 7 — Scale & productize (post-revenue)

- More generators (Printable Games, etc.)  
- Stronger QA / branding templates  
- Multi-user / limited SaaS if it serves the business  
- Cost optimization and caching of generation  

---

## Functional Requirements

### FR-1 Research

- Accept **manual ideas** (titles, niches, keywords, competitor notes).
- Optionally ingest from an **external research service** (e.g. EverBee) via adapter.
- Output a normalized **Research Brief** consumed by Generator Engine (niche, keywords, constraints, suggested product type).
- Research providers must be replaceable without changing generators or publishers.

### FR-2 Generator Engine (core)

- Host multiple **independent generators** selected via Strategy Pattern.
- Each generator produces a **Product Artifact**: files, metadata (title, description, tags), and packaging hints.
- Initial target generators (not all in MVP):
  - Clipart Generator  
  - Coloring Book Generator  
  - Planner Generator  
  - Printable Game Generator  
  - Flashcard Generator  
- Adding a generator = implement strategy + register it; no changes to pipeline orchestration beyond config.

### FR-3 QA

- Validate required files exist and match marketplace constraints (format, size, count).
- Validate metadata completeness (title length, tags, description placeholders).
- Block publish on hard failures; warn on soft issues.
- Persist QA reports linked to generation jobs.

### FR-4 Publisher

- Marketplace **adapters** with a shared publish interface.
- Target adapters (future): Etsy, Gumroad, Creative Market, Shopify, Ko-fi.
- MVP: one adapter (full publish or “prepare listing package” if API limits block automation).
- Store external listing IDs and publish status.

### FR-5 Analytics

- Track generation history, job outcomes, and product statuses.
- Ingest or enter **revenue** and basic marketplace stats.
- Surface which product types / niches perform.
- Later: feed insights back to Research (recommendation lists, not autonomous sprawl).

### FR-6 Pipeline / Jobs

- Orchestrate: Research → Generator → QA → Publisher → Analytics.
- Support queued and running jobs with states: `pending`, `running`, `succeeded`, `failed`, `cancelled`.
- Allow re-run from a failed stage without always regenerating from scratch.

### FR-7 Dashboard (modern AI SaaS)

Must display:

- Products  
- Queue  
- Revenue  
- Generation history  
- Running jobs  
- Marketplace statistics  
- Analytics  

Operator-friendly: clear statuses, cost/revenue at a glance, start or retry jobs without CLI.

### FR-8 Modularity for Cursor

- Clear module boundaries documented so Cursor tasks touch one module per milestone.
- Interface-first design for Research, Generators, QA, Publishers.

---

## Non Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | **Low monthly cost** — prefer managed free/cheap tiers; avoid always-on GPU; cache generation assets when useful |
| NFR-2 | **MVP first** — ship vertical slices; reject speculative abstractions that don’t unblock revenue |
| NFR-3 | **Modular** — adapters and strategies; swap Research or Marketplace without core rewrite |
| NFR-4 | **Easy expansion** — new generator or marketplace in a bounded PR, not a rewrite |
| NFR-5 | **Operator reliability** — failed jobs are visible, retryable, and don’t silently drop products |
| NFR-6 | **Observability light** — logs + job status enough for one operator; no heavy APM required initially |
| NFR-7 | **Security basics** — secrets in env; marketplace tokens never committed; least privilege on APIs |
| NFR-8 | **Cursor-friendly structure** — small modules, explicit interfaces, milestone-sized tasks |
| NFR-9 | **Time-to-money** — architecture choices favor shipping listings in days/weeks of effort, not perfect systems |
| NFR-10 | **Maintainability** — boring, readable code over clever frameworks when coding starts |

---

## Architectural Principles

1. **Money over elegance**  
   Choose the option that gets a sellable SKU live sooner, if quality remains marketplace-acceptable.

2. **Business validation before automation**  
   Prove a niche/product type sells (or gets favorites/views) before investing in autonomous loops for it.

3. **MVP first, adapters early**  
   Build the thinnest real pipeline, but put **interfaces** around Research and Marketplaces from the start so replacements are cheap.

4. **Generator Engine is the heart**  
   All product types plug in as strategies. Pipeline stages speak to Engine and Artifacts, not to one-off scripts forever.

5. **Strategy Pattern for generators**  
   `GeneratorStrategy` (name TBD in code) → `generate(brief) → ProductArtifact`. Registry selects by product type.

6. **Adapter Pattern for marketplaces & research**  
   `ResearchProvider` and `MarketplacePublisher` implement swap-in providers (EverBee → own Research Agent; Etsy → Gumroad, etc.).

7. **Pipeline is a queue of stages, not a monolith**  
   Each stage is independently retryable and testable.

8. **Thin dashboard, fat clarity**  
   Dashboard reflects operational truth; it is not a second product. Prefer one composition of status + actions.

9. **Cost is a feature**  
   Track approximate API spend per job; kill expensive paths that don’t convert.

10. **Cursor never builds the whole app at once**  
    Work is split into milestones that each produce a reviewable increment (interface → one strategy → one adapter → dashboard panel).

11. **Replace internals, keep contracts**  
    Own Research Agent later must implement the same Research Brief contract.

12. **De-risk legal/marketplace ToS early**  
    Prefer compliant listing practices; store provenance of generated content for disputes.

---

## Success Metrics

### Business (1–3 months) — primary

| Metric | Target guidance |
|--------|-----------------|
| Sellable products listed | First listing ASAP; then a steady weekly cadence |
| Marketplace engagement | Favorites/views/clicks rising on at least one niche |
| Revenue | Non-zero sales; then trend toward covering monthly platform + API costs |
| Time per product | Operator time from brief → listing package shrinks each week |
| Cost per product | Fully loaded generation cost well below expected ASP (average selling price) |

### Product / system — secondary

| Metric | Guidance |
|--------|----------|
| Pipeline success rate | Majority of jobs reach QA pass without manual file surgery |
| Retry clarity | Failed jobs have actionable errors |
| Module swap cost | New generator or marketplace adapter is a small, isolated change |
| Dashboard usefulness | Operator runs day-to-day from UI, not scattered scripts |

**North star:** profitable digital products shipped and improved via analytics—not agent sophistication scores.

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Generating products nobody wants | High | Business validation first; start from real marketplace research; kill niches early |
| Marketplace ToS / API limits | High | Adapter supports “export package” fallback; stay compliant; don’t scrape aggressively |
| AI content quality rejects | Medium–High | Generator-specific templates + QA gates; human spot-check early |
| API/generation costs exceed revenue | High | Cost meters; cheap models for drafts; cache; batch; one generator until ROI |
| Overbuilding agents/platform | High | Non-goals enforced; milestones gated on revenue/learning |
| EverBee / external research dependency | Medium | Research adapter; keep manual ingest path always available |
| Multi-marketplace complexity too early | Medium | One marketplace until revenue; then adapters |
| Legal (copyright, trademarks in niches) | High | Niche guidelines; avoid branded IP; keep generation prompts constrained |
| Operator bottleneck | Medium | Queue + retries; automate packaging before perfect publish APIs |
| Cursor / AI-coding sprawl | Medium | Small milestones, this doc as guardrail, one module per task |

---

## Business Validation Strategy

### Principle

**Do not automate what you have not validated.**  
Validation means marketplace evidence (search demand, competition quality, listings, early sales)—not internal demo confidence.

### Loop

1. **Hypothesis** — niche + product type + price point (e.g. “watercolor clipart packs for wedding planners on Etsy”).
2. **Research** — EverBee / own notes / keyword tools → Research Brief.  
3. **Minimum viable listing** — generate smallest acceptable pack; publish or soft-launch.  
4. **Measure** — views, favorites, conversion, revenue; cost per listing.  
5. **Decide** — scale generator for winners, tweak, or kill.  
6. **Only then** — deepen automation (more generators, own Research Agent, multi-marketplace).

### Validation gates (before heavy investment)

| Gate | Question | Fail action |
|------|----------|-------------|
| Niche gate | Is there proven demand and workable competition? | Don’t generate at scale |
| Product-type gate | Does one generator strategy produce acceptable files? | Fix templates/QA before queueing 50 jobs |
| Channel gate | Can we list on at least one channel reliably? | Ship manual upload package first |
| Unit economics gate | Is cost per product << expected revenue * conversion? | Change model/provider or niche |
| Automation gate | Does the niche sell enough to justify a new adapter/agent? | Keep manual steps |

### Research modularity in validation

- Phase 1–2: external research + human judgment is fine.  
- Phase 6: own AI Research Agent only when the bottleneck is research throughput/cost—not because agents are cool.

### Dashboard role in validation

The SaaS-style dashboard exists to make the loop visible: what was generated, what is queued, what earned money, what wasted spend. **Analytics drive the next Research Brief**, closing the factory loop.

---

## Cursor Development Doctrine

> Enforced process for when implementation begins. Still no code in this phase.

1. **One milestone = one narrow outcome** (e.g. “define Research Brief type + manual provider,” not “build platform”).
2. **Never ask Cursor to generate the entire application.**
3. Prefer: interfaces → one implementation → tests/smoke → dashboard panel → next adapter.
4. Each PR/milestone should be reviewable in isolation.
5. Keep `PROJECT.md` updated when vision or scope changes; do not let code invent new product goals silently.
6. Suggested first coding milestones (for later, not now):
   1. Repo skeleton + env + `README` pointing here  
   2. Domain models: Research Brief, Product Artifact, Job  
   3. Generator Engine interface + one strategy (offline/stub ok)  
   4. QA rules for that strategy  
   5. One publisher adapter (or zip pack export)  
   6. Job runner + queue  
   7. Dashboard shell: products / jobs / history  
   8. Revenue & stats widgets (even if fed by CSV)  
   9. Second generator  
   10. Second marketplace adapter  

---

## Document Status

| Field | Value |
|-------|--------|
| Document | `PROJECT.md` |
| Project | AI Product Factory |
| Phase | Architecture / product brief only |
| Code | **None** — intentionally |
| Audience | Founder, future Cursor sessions, Lead Architect |
| Next step | Approve vision → start Phase 0/1 coding milestones as separate Cursor tasks |

---

*This file is the constitution for AI Product Factory. Implementation must defer to these goals: MVP, validation before automation, low cost, modular adapters, and Generator Engine strategies—optimized for profitable products in the next 1–3 months.*
