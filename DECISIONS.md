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
| **Future reconsideration** | Add Analytics UI in Phase 7 when enough listings exist that a sheet is painful. |

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
| **Future reconsideration** | If only Clipart exists and Assembler stays trivial, keep it thin or inline. Split/invest when PDF-heavy generators (e.g. Coloring Books) arrive. |

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
| **Tradeoffs** | Abstraction cost; temptation to build a template CMS before first sale. Deep trees (Animal → Ocean → Age) are overkill for Clipart MVP. |
| **Future reconsideration** | Keep MVP templates flat (params). Adopt deeper composition when a second generator or high niche churn demands it. Drop the layer if unused. |

---

## D-008 — MVP implements only Clipart Generator

| Field | Content |
|-------|---------|
| **Decision** | Only **one** generator strategy in MVP: **Clipart**. All other product types remain interfaces/future work. |
| **Reason** | Highest near-term revenue probability with lowest packaging complexity: proven digital category, independent images, ZIP+preview listings, fast niche iteration, lower cost than PDF-centric products. |
| **Tradeoffs** | Misses Coloring Book/Planner demand; clipart markets are competitive; AI art may underperform premium packs. |
| **Future reconsideration** | Add Coloring Book (or whichever niche validates via research) only after Clipart unit economics work or research shows Clipart is a dead end for us. |

---

## D-009 — Roadmap ordered by business value; Research Agent last

| Field | Content |
|-------|---------|
| **Decision** | Roadmap order: Foundation → Generator Engine → One Generator → Assembler → Minimal Dashboard → QA → Export Publisher → Analytics → Marketplace automation → More generators/templates → **Research Agent last**. |
| **Reason** | Each step either creates a sellable package or reduces operator pain on the money path. Research Agent and publish APIs do not create the first dollar. |
| **Tradeoffs** | Feels less “AI complete”; external research remains manual/tool-assisted longer. |
| **Future reconsideration** | Reorder only if evidence shows a different bottleneck (e.g. upload labor >> generation). Never move Research Agent before first validated revenue without new evidence. |

---

## D-010 — Analytics deferred until after Export Publisher

| Field | Content |
|-------|---------|
| **Decision** | Revenue and marketplace analytics are explicitly post-MVP (after export path works). |
| **Reason** | No analytics needed to ship packs; vanity dashboards delay validation. |
| **Tradeoffs** | Weaker in-app feedback loop early. |
| **Future reconsideration** | Phase 7 when listing count makes spreadsheets the bottleneck. |

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
| **Future reconsideration** | Convert critiques into killed features or accepted risks after first revenue checkpoint. |

---

## Change log

| Date | Change |
|------|--------|
| 2026-07-14 | Initial decision log from architecture review (Assembler, export-first Publisher, ops dashboard, Clipart-only MVP, Research Agent deferred). |
