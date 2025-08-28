# Architecture — Travelmate AI

> This document defines the **system architecture** for Travelmate AI. It is referenced from `CLAUDE.md`.

---

## 1) Purpose & Scope

* MVP core: **Natural language → Day-by-day itinerary → Save & revisit**
* Future adaptability: health data, budget, external services
* Tech stack: Next.js 15 + React 19 + Tailwind + Recharts, Vitest + Playwright, GitHub Actions
* Persistence: In-memory (MVP) → Supabase/Postgres with Prisma (future)

---

## 2) High-Level Architecture

* **Presentation (UI)**: Pages for Home, Plan Detail, Explore, My Trips
* **API Layer**: Next.js API routes for itineraries, explore, and trips
* **Application Layer**: Use cases (create, get, list, add, delete itineraries/trips), Zod validation
* **Domain Layer**: Core types (`Itinerary`, `Day`, `Segment`) and repository ports
* **Infrastructure Layer**: Stub/LLM planner adapters, in-memory repos (MVP), DB repos later

---

## 3) Routing

* `/` → Home
* `/plan/[id]` → Plan Detail
* `/explore` → Explore
* `/my-trips` → My Trips
* `/api/*` → API endpoints

---

## 4) Data Contracts (simplified)

```ts
type Itinerary = { id: string; title: string; sourceQuery: string; days: Day[] };
type Day = { date: string; segments: Segment[] };
type Segment = { type: "poi"|"move"|"meal"|"buffer"; [key: string]: any };
```

---

## 5) Non-Functional Requirements

* **Performance**: Home submit → Plan display ≤ 10s (P95)
* **Availability**: 99.5% uptime
* **Accessibility**: WCAG AA compliance
* **Process**: TDD mandatory, CI gate on lint/type/test
* **Rate limiting**: 429 on abuse

---

## 6) Error Handling

* Central mapping: 400 invalid, 422 validation, 429 throttling, 404 missing, 5xx internal
* LLM fallback: return template itinerary if AI fails

---

## 7) Security & Privacy

* Never log PII
* Supabase storage = private buckets; public via signed URLs only
* Future: enforce RLS with `user_id = auth.uid()`
* Provide export/delete endpoints

---

## 8) Testing & CI

* Unit tests: use cases & repositories (Vitest)
* API tests: route-level
* E2E tests: Playwright (Home → PlanDetail)
* CI: GitHub Actions must pass `pnpm run check`

---

## 9) Release Criteria

* Meets acceptance criteria in @docs/requirements-roadmap.md
* Tests cover APIs (happy/error)
* CI green: lint/type/test
* No critical issues

---

## 10) References

* @CLAUDE.md
* @docs/requirements-business.md
* @docs/requirements-roadmap.md
