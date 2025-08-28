# Coding Guidelines — Travelmate AI

## 1) Types & Safety

- Prefer **precise `type`** definitions
- **Avoid `any` and `unknown` in production**; use `unknown` only if unavoidable and narrow with type guards (`typeof`, `in`, discriminated unions)
- If forced to use `any` (external libs), add `eslint-disable` with justification
- Domain models: immutable, `readonly` fields, state changes return new instances

---

## 2) Test-Driven Development (TDD)

- **Red → Green → Refactor** is mandatory
- Tests are **the specification**; do not change tests except for spec change, test error, or non-determinism
- **Test pyramid**:
  - Unit tests: 60–80% coverage (focus on logic, UseCases, Domain)
  - API/Integration: 15–30%
  - E2E: 5–10%, only critical flows
- Tests follow **AAA pattern** (Arrange, Act, Assert)
- Each test: one clear assertion where possible

---

## 3) Code Style

- Arrow functions only (no `function` keyword)
- Use `map`/`filter`/`reduce` instead of `for`/`forEach`
- Shallow nesting, prefer early returns
- Single-responsibility functions/components
- Apply DRY, but avoid over-abstraction

---

## 4) Naming

- Constants: `UPPER_SNAKE_CASE` (or `PascalCase` for objects)
- Types/Components: `PascalCase`
- Variables/Functions: `camelCase`
- **Do not use modification-suggestive names** (e.g., `enhancedX`, `fixedY`, `updatedZ`)

---

## 5) Documentation (JSDoc)

All functions, classes, and public methods require concise **JSDoc**:

```typescript
/**
 * Fetch itinerary by id.
 * @param id - Itinerary identifier
 * @returns Itinerary or null if not found
 */
const getItinerary = (id: string): Itinerary | null => { ... };
```

JSDoc should explain purpose, parameters, and return values (not implementation details).

---

## 6) Checklist

- [ ] No `any`/`unknown` in production code (only allowed in tests with explicit reason)
- [ ] Functions/components use arrow functions
- [ ] No `for`/`forEach` (use declarative iteration)
- [ ] Early returns, shallow nesting
- [ ] Clear, stable names
- [ ] Domain types are immutable (`readonly`)
- [ ] Tests cover 80%+ (unit-focused)
- [ ] Tests are deterministic and follow AAA
- [ ] `pnpm run check` passes (lint/type/test)
- [ ] Remove debug code, unused imports, prompt text

---

## References
- @CLAUDE.md
- @docs/process.md