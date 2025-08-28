# Product Roadmap — Travelmate AI

> This document is part of the requirements split and focuses on development phases and deployment criteria.

---

## 1) Roadmap Overview

### 🟢 Short-term (MVP: Phase 0–4)

* Natural language input field with example prompts.
* LLM + rule-based itinerary generation (Zod schema validation).
* PlanDetail page with timeline view.
* Always display source query banner.
* URL revisitability for saved plans.
* TDD/CI quality gates (`pnpm run check`).

### 🚀 Mid-term (Phase 5–10)

* Itinerary editing UI (drag & drop, add/remove/reorder activities).
* Explore feature with filtering (region, duration, popularity).
* Sharing options (public/private, social media integration).
* External API integration (flights, hotels, maps).
* Performance optimization (P95 ≤ 10s).

### 🌍 Long-term (Phase 11+)

* Health data integration (Apple HealthKit, HRV, sleep, heart rate).
* Budget/financial data integration (NISA, credit card points).
* Community features (share itineraries, ranking, cloning others’ plans).
* Cross-platform expansion (mobile apps, PWA, Notion integration).

---

## 2) Deployment Gate (Revised MVP Definition)

* MVP milestone reached at **Phase 4** completion:

  1. Real AI-backed itinerary generation with Zod schema validation.
  2. Fallback to template itinerary on validation failure or timeout.
  3. Guaranteed re-fetch consistency (`GET /api/itineraries/:id`).
  4. Source query always displayed in PlanDetail.
  5. End-to-end latency: **P95 ≤ 10 seconds**.
  6. Removal of all leftover create-xyz code and dummy data.
  7. CI pipeline always green (`pnpm run check`).

---

## 3) Post-Launch Guards

* Feature flags for AI provider and fallback switching.
* Throttling for rate limiting (429 responses).
* Monitoring KPIs: success rate, P95 latency, revisit frequency, 429/5xx errors.

---

## 4) References

* @CLAUDE.md
* @docs/requirements-business.md
