# Business Requirements — Travelmate AI

> This document is part of the requirements split and focuses on user context, business vision, and value proposition.

---

## 1) Target Users

* Individual travelers aged 20–40 with vague plans about destination, budget, or trip length.
* Digital nomads and people considering overseas relocation.

---

## 2) Current Pain Points

* Generic AI chat tools generate ideas but results are **ephemeral** and difficult to manage.
* Early trip planning steps (search → compare → create itinerary) are heavy and discouraging.

---

## 3) Vision

> **“AI fills the first blank page, sparking the journey.”**

A single natural language input should generate a realistic draft itinerary, making travel planning approachable.

---

## 4) Value Proposition

* **One-sentence input → structured itinerary**
* **Transparency**: always display the source query
* **URL revisitability**: itineraries are saved and revisitable anytime

---

## 5) Differentiation from Other Services

| Aspect            | Generic ChatGPT/Claude                   | Travelmate                                              |
| ----------------- | ---------------------------------------- | ------------------------------------------------------- |
| **UX**            | Generic chat, requires scrolling history | Dedicated travel UI (Home → PlanDetail timeline)        |
| **Output**        | Text-based, low reproducibility          | Structured itinerary schema (Zod)                       |
| **Transparency**  | No clear reasoning                       | Always shows input query in banner                      |
| **Persistence**   | Copy-paste conversation                  | URL-based revisit, shareable                            |
| **Quality**       | Inconsistent                             | TDD + CI/CD ensures stability                           |
| **Extensibility** | General purpose                          | Travel-focused, with health/finance integration roadmap |

---

## 6) Unique Value

### 6.1 AI Travel Notebook

* Itineraries are not temporary chat logs but persistent assets.
* Users can revisit, reuse, and compare trips.

### 6.2 Contextual User Data

* Incorporates health (sleep, HRV), activity, and budget data.
* Enables **“a trip aligned with personal wellness and finances.”**

---

## 7) References

* @CLAUDE.md
* @docs/requirements-roadmap.md
