# Claude Code Development Rules

## Purpose
This repository prioritizes **simplicity, readability, and reusability**. Development must follow the rules and workflows below to ensure quality and consistency.

---

## Core Principles

- **Claude Code Flow is mandatory**: *Planning & Staging → Implementation Flow → When Stuck → Quality Gates → Test Guidelines*
- **Test-Driven Development (TDD)**: Red → Green → Refactor
- **Tests define specification**; do not change tests unless the specification changes, a test is wrong, or non-determinism needs removal
- **Testability > Readability > Consistency > Simplicity > Reversibility**
- **Types**: Prefer precise `type`. Avoid `any` and `unknown` in production; use `unknown` only if unavoidable, with narrowing and a comment/TODO
- **Immutability**: Domain models use `readonly` fields; state changes must create new instances
- **Style**: Arrow functions only; use `map`/`filter`/`reduce`; avoid `for`/`forEach`; prefer early returns to deep nesting
- **Naming**: Clear, descriptive; no modification-suggestive names like `enhancedX`, `fixedY`, `updatedZ`
- **Comments**: Only for business logic intent; do not explain implementation details

---

## Development Process (R-P-T-I-V)

### 1. Planning & Staging
- Use `/plan_feature` to break features into 3–5 clear stages
- Record in `docs/requirements-roadmap.md`
- Provide concise plan (≤10 lines): purpose, inputs/outputs, main types, scope, risks

### 2. Implementation Flow
- **Understand**: Read relevant code/docs before writing
- **Test**: Write failing test (AAA pattern)
- **Implement**: Minimal code to pass tests
- **Refactor**: Clean up while keeping tests green
- **Commit**: Conventional Commits with clear *why*

### 3. When Stuck (Rule of Three)
- If stuck after 3 attempts: stop, record what failed, research alternatives, adjust abstraction, retry with new approach

### 4. Quality Gates & Definition of Done
- All relevant tests exist and are green
- Coverage ≥80% (infra/I/O can be excluded)
- `pnpm run check` (lint + type + test) passes
- No unused imports, debug code, or prompt artifacts
- Docs updated with any spec change

### 5. Test Guidelines
- Unit tests: 60–80% of coverage
- API/Integration: 15–30%
- E2E: minimal, critical paths only
- Naming: `should_<business_rule>`
- Tests must be deterministic

---

## JSDoc

All functions, classes, and public methods must include **concise JSDoc**:

```typescript
/**
 * Calculates the score from an itinerary.
 * @param itinerary - Target itinerary
 * @returns Total score
 */
const calculateScore = (itinerary: Itinerary): number => { ... };
```

---

## Imports (always loaded)
- @docs/coding-guidelines.md
- @docs/process.md

(*Other reference docs such as security/privacy, requirements, and architecture are consulted on demand, not imported by default.*)

---

## Quick Slash Commands

- `/plan_feature {title}` — Feature breakdown & test specs
- `/write_tests {unit|e2e} {scope}` — Create failing tests
- `/implement_step {scope}` — Minimal diffs only
- `/refactor {scope}` — Safe improvements (keep tests green)
- `/review_pr` — Review against checklist

---

## References
- @docs/coding-guidelines.md
- @docs/process.md
