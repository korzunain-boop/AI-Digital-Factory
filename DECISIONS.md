# AI Product Factory — Decision Log

> Major architectural decisions. Update this file whenever a decision changes.  
> Companion: [`PROJECT.md`](./PROJECT.md).  
> **No code in this phase.**

Priority order for decisions:

1. Faster business validation  
2. Lower implementation complexity  
3. Lower monthly costs  
4. Easier future expansion  

…over technical elegance.

**Money filter (overrides elegance):** every roadmap feature must increase P(earning money in 1–3 months) or move to the backlog.

---

## D-001 — Generator Engine is the heart of the system

| Field | Content |
|-------|---------|
| **Decision** | The Generator Engine remains the core of the architecture. Product types plug in as strategies. Other modules exist to feed briefs in and ship Engine output out. |
| **Reason** | Revenue comes from generated digital products. A single orchestration point for product types reduces chaos as niches and formats expand. |
| **Tradeoffs** | Risk of over-abstracting the Engine before a second generator exists; may slow MVP if registry/ceremony is built too early. |
| **Future reconsideration** | If after months only one generator exists and expansion is unlikely, collapse Engine to a single module. Revisit when adding a second product type (Phase 9). |

---

## D-002 — Research is an interchangeable provider; default is external/manual

| Field | Content |
|-------|---------|
| **Decision** | Research stays behind a provider interface. **Default workflow** is EverBee (or similar), manual ideas, and CSV import. **Own AI Research Agent is not planned for early phases**—only as a late provider after validation. |
| **Reason** | Niche selection skills and paid tools already exist. Building a Research Agent does not improve time-to-first-listing and burns cost/complexity. |
| **Tradeoffs** | Dependency on human judgment and/or third-party tools; less “full stack AI” narrative. |
| **Future reconsideration** | Add Research Agent provider only when research throughput/cost is the proven bottleneck (roadmap Phase 10)—not earlier. |

---

## D-003 — MVP dashboard is operations-only

| Field | Content |
|-------|---------|
| **Decision** | MVP dashboard shows: Products, Queue, Running Jobs, Generation History, Job Status. **No** revenue analytics, marketplace analytics, or advanced charts in MVP. |
| **Reason** | Early need is running the factory and seeing failures—not BI. Marketplace UIs and spreadsheets cover revenue until volume hurts. |
| **Tradeoffs** | Operator switches tools for sales numbers; less “SaaS complete” feel. |
| **Future reconsideration** | Add Analytics UI in Phase 7 when enough listings exist that a sheet is painful—and only after Commercial Validation (D-015). |

---

## D-004 — Publisher has two modes; Export is MVP

| Field | Content |
|-------|---------|
| **Decision** | Publisher supports (1) **Export listing package** and (2) **Marketplace publishing**. MVP implements **Export only**. Publishing automation is Phase 8+. |
| **Reason** | Marketplace APIs, ToS, and auth are unpredictable. Export unblocks listings immediately via manual upload. |
| **Tradeoffs** | Manual upload labor; slower listing cadence at scale. |
| **Future reconsideration** | Implement Publish mode for one marketplace once export loop is profitable and API access is clearly worth the build. Keep Export forever as fallback. |

---

## D-005 — Add Assembler stage to the pipeline

| Field | Content |
|-------|---------|
| **Decision** | Pipeline is `Research → Generator → Assembler → QA → Publisher`. Assembler packages files, creates ZIP and previews, builds metadata package, and generates PDFs when required. |
| **Reason** | Separating asset creation from product packaging keeps generators simple and makes QA validate sellable outputs. Matches how digital products actually ship. |
| **Tradeoffs** | Extra stage and module vs a generate-and-zip script; risk of Assembler becoming a design tool. |
| **Future reconsideration** | If the First Commercial Generator needs only trivial packaging, keep Assembler thin or inline. Invest when PDF-heavy strategies arrive. |

---

## D-006 — Generators produce assets only; QA validates finished packages

| Field | Content |
|-------|---------|
| **Decision** | Generators emit raw assets. Assembler produces the Product Package. QA runs on Assembler output. |
| **Reason** | Prevents generators from reimplementing packaging; catches listing-ready defects (missing previews, bad ZIP, incomplete metadata). |
| **Tradeoffs** | Cannot “QA while generating” without stage coupling; failed assemble wastes prior GPU/API spend unless retries skip regenerate. |
| **Future reconsideration** | Add cheap pre-checks on assets if failure modes show systematic generator bugs; don’t merge Assembler back into Generator without cause. |

---

## D-007 — Generator Templates layer (data-driven composition)

| Field | Content |
|-------|---------|
| **Decision** | Introduce a Generator Template layer so strategies compose reusable templates (e.g. theme/style/audience) instead of coding every niche from scratch. |
| **Reason** | Faster niche variants and less duplicated prompt/layout logic; supports expansion without forking generators. |
| **Tradeoffs** | Abstraction cost; temptation to build a template CMS before first sale. Deep trees are overkill before Commercial Validation. |
| **Future reconsideration** | Keep MVP templates flat (params). Adopt deeper composition when a second generator or high niche churn demands it. Drop the layer if unused. |

---

## D-008 — One First Commercial Generator (not a permanently fixed Clipart MVP)

| Field | Content |
|-------|---------|
| **Decision** | MVP implements **exactly one** generator strategy: the **First Commercial Generator**. Its concrete category is **selected after validating the niche**, not hardcoded forever in project docs or Engine contracts. **Clipart may still be the initial implementation**—that is a **business decision**, not an architectural constraint. All other product types remain future strategies. |
| **Reason** | Locking Clipart (or any category) into the constitution creates false certainty and makes pivots feel like “breaking the architecture.” Architecture must stay strategy-based; category choice must stay falsifiable via marketplace evidence. |
| **Tradeoffs** | Docs are slightly less specific about day-one assets; team must run a short niche choice before coding the strategy body. |
| **Future reconsideration** | Record the chosen category (e.g. “First Commercial Generator = Clipart”) as a dated decision when selected. If Commercial Validation fails, replace the strategy; do not change Engine/Assembler/Publisher architecture. **Supersedes** the earlier “Clipart permanently = MVP” wording. |

---

## D-009 — Roadmap ordered by business value; Research Agent last

| Field | Content |
|-------|---------|
| **Decision** | Roadmap order: Foundation → **Architecture Review** → Generator Engine → **First Commercial Generator** → Assembler → Minimal Dashboard → QA → Export Publisher → **batch (20–50) + manual publish + data + Commercial Validation** → (continue only if positive) Analytics → Marketplace automation → More generators/templates → **Research Agent last**. |
| **Reason** | Each early step creates or measures sellable packages. Research Agent and publish APIs do not create the first dollar. Commercial Validation prevents building analytics/automation on a dead category. |
| **Tradeoffs** | Feels less “AI complete”; external research remains manual/tool-assisted longer; expansion pauses at the gate. |
| **Future reconsideration** | Reorder only if evidence shows a different bottleneck. Never move Research Agent before first validated revenue without new evidence. Never skip Commercial Validation. |

---

## D-010 — Analytics deferred until after Export Publisher

| Field | Content |
|-------|---------|
| **Decision** | Revenue and marketplace analytics are explicitly post-MVP and **after Commercial Validation** (after export path works and batch signals exist). |
| **Reason** | No analytics needed to ship packs; vanity dashboards delay validation. |
| **Tradeoffs** | Weaker in-app feedback loop early. |
| **Future reconsideration** | Phase 7 when listing count makes spreadsheets the bottleneck and validation has passed or is clearly passing. |

---

## D-011 — Prefer low monthly cost and thin hosting

| Field | Content |
|-------|---------|
| **Decision** | Architecture and MVP assume cheap hosting, no always-on GPU, and pay-per-use generation APIs. |
| **Reason** | 1–3 month goal is profit after costs; fixed infra burn raises break-even. |
| **Tradeoffs** | Less performance headroom; cold starts / slower jobs acceptable. |
| **Future reconsideration** | Scale infra only when job volume or latency clearly limits revenue. |

---

## D-012 — Cursor milestone doctrine enforced

| Field | Content |
|-------|---------|
| **Decision** | Development proceeds in very small milestones; Cursor must not generate the entire application at once. Docs (`PROJECT.md`, `DECISIONS.md`) gate scope. |
| **Reason** | Large AI-generated dumps create unmaintainable surface area and delay the export loop. |
| **Tradeoffs** | More PRs; slower “impressive demo”; requires discipline. |
| **Future reconsideration** | Process stays; only milestone sizing adjusts with team familiarity. |

---

## D-013 — Formal critical review retained in PROJECT.md

| Field | Content |
|-------|---------|
| **Decision** | Keep an honest Critical Review section that challenges platform vs script, template depth, QA ceremony, and early abstractions. |
| **Reason** | Protects revenue focus from architect ego and premature platforms. |
| **Tradeoffs** | Docs look less “confident”; may confuse implementers if not paired with hard MVP scope. |
| **Future reconsideration** | Convert critiques into killed features or accepted risks after first revenue checkpoint / Commercial Validation. |

---

## D-014 — First Commercial Generator replaces permanently fixed Clipart MVP

| Field | Content |
|-------|---------|
| **Decision** | Project language and scope use **First Commercial Generator**. Architecture (Strategy Pattern / Engine) is unchanged. Initial implementation **may** still be Clipart if niche validation supports it—as a business pick recorded when chosen. |
| **Reason** | Prevents documentation from treating one product category as destiny; keeps pivots cheap when marketplace signals disagree. |
| **Tradeoffs** | Requires an explicit niche→category choice step before strategy implementation. |
| **Future reconsideration** | When the first strategy is chosen, add a dated note here (category + evidence). On validation failure, date a pivot note—still no architecture rewrite. See also D-008. |

---

## D-015 — Commercial Validation Gate (mandatory)

| Field | Content |
|-------|---------|
| **Decision** | After First Commercial Generator + Export flow: generate **20–50** products, **publish manually**, **collect marketplace data**, then run **Commercial Validation**. Continue roadmap expansion only if the hypothesis shows positive signals. If it fails: **pivot the product category, not the architecture.** |
| **Reason** | Stops platform buildout on an unvalidated category; forces learning from real listings before Analytics, marketplace automation, more generators, or Research Agent. |
| **Tradeoffs** | Slower “feature progress”; emotional cost of pausing; may delay polished SaaS surfaces. |
| **Future reconsideration** | Adjust batch size (20–50) if cost or seasonality demands, but do not remove the gate. Document pass/fail in this log. |

---

## D-016 — Generator Engine remains product-agnostic

| Field | Content |
|-------|---------|
| **Decision** | Generator Engine must **never** know product details. It only: (1) receives Generation Requests, (2) selects the proper Generator Strategy, (3) executes it, (4) returns Generation Results. Clipart/Planner/ColoringBook/etc. logic belongs **exclusively** inside Generator Strategies (and their templates). |
| **Reason** | Keeps pivots and new categories from contaminating the core; preserves Strategy Pattern integrity; reduces rewrite risk when Commercial Validation forces a category change. |
| **Tradeoffs** | Slightly more indirection than a single hardcoded generator script. |
| **Future reconsideration** | Only revisit if a single strategy remains forever and indirection is proven pure overhead—after long-run evidence, not before first validation. |

---

## D-017 — Architecture Review before implementation

| Field | Content |
|-------|---------|
| **Decision** | Insert **Architecture Review** between Foundation and Generator Engine. Purpose: **freeze interfaces** before implementation. **No feature work starts before Architecture Review is approved.** |
| **Reason** | Prevents Cursor/feature thrash on unstable contracts; forces explicit agreement on Request/Result, Strategy boundary, Assembler inputs/outputs, and Publisher modes. |
| **Tradeoffs** | Short delay before coding; risk of over-freezing—keep review thin and revenue-focused. |
| **Future reconsideration** | Re-open review only for contract-breaking changes; prefer additive strategy changes over interface churn. |

---

## D-018 — Money filter outranks technical elegance

| Field | Content |
|-------|---------|
| **Decision** | Every feature on the roadmap must answer: “Does this increase the probability of earning money within the next 1–3 months?” If **No**, move it to the backlog. This rule has **higher priority than technical elegance.** |
| **Reason** | Stops elegant-but-non-monetizing work (deep template CMS, early analytics, Research Agent, multi-marketplace adapters) from consuming the validation window. |
| **Tradeoffs** | Some good engineering is deferred; docs/architecture may look “incomplete.” |
| **Future reconsideration** | After Commercial Validation pass and stable revenue, backlog items may re-enter if they clearly raise margin, throughput, or reliability. |

---

## Change log

| Date | Change |
|------|--------|
| 2026-07-14 | Initial decision log from architecture review (Assembler, export-first Publisher, ops dashboard, Clipart-only MVP, Research Agent deferred). |
| 2026-07-14 | CTO refinement: First Commercial Generator (D-008/D-014); Commercial Validation Gate (D-015); product-agnostic Engine (D-016); Architecture Review (D-017); money filter (D-018); roadmap updated. |
