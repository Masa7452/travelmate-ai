# Development Process — Travelmate AI

> Referenced from `CLAUDE.md`. Defines how to work with Claude Code for this project.

---

## Claude Code Flow

1. **Planning & Staging**

   * Use `/plan_feature {title}` to break down features into 3–5 clear stages.
   * Record stages in `docs/requirements-roadmap.md`.
   * Each stage includes:

     * **Goal**: clear outcome
     * **Inputs/Outputs**: expected data flow
     * **Main Types**: relevant domain models
     * **Scope**: affected modules/files
     * **Risks**: potential pitfalls and mitigations

   **Stage Template:**

   ```markdown
   ## Stage N: [Name]
   - Goal: [clear outcome]
   - Success Criteria: [measurable result]
   - Tests: [key cases in AAA style]
   - Status: [Not Started | In Progress | Complete]
   ```

2. **Implementation Flow**

   * **Understand**: Review related code, docs, requirements, and existing tests before coding.
   * **Test**: Write a failing test first (AAA pattern).
   * **Implement**: Add the minimal code to pass tests.
   * **Refactor**: Improve readability/consistency/structure while keeping tests green.
   * **Commit**: Use Conventional Commits, always explain *why*.

3. **When Stuck (Rule of Three)**

   * If stuck after 3 attempts: stop → record what failed → research alternatives → adjust abstraction → retry.

---

## Quality Gates & Definition of Done

* All relevant tests exist and are green
* Coverage ≥80% (infra/I/O can be excluded)
* `pnpm run check` (lint + type + test) passes
* No unused imports, debug code, or prompt artifacts
* Documentation updated when specs change
* Small, reviewable PRs only

---

## Testing Guidelines

* **Unit tests**: 60–80% of coverage (Service/UseCase/Domain logic, component behaviors, validation)
* **API/Integration tests**: 15–30% (I/O contracts, error mapping)
* **E2E tests**: 5–10%, only critical flows (Home → PlanDetail)
  * E2E does NOT test: validation rules, error messages, loading states, edge cases
  * E2E only verifies: main user journey completion, basic navigation, critical business flows
* Follow **AAA pattern** (Arrange → Act → Assert)
* Each test should have one clear assertion where possible
* Do not rely on implementation details

---

## Output Format (Claude Code)

1. **Plan** — concise (≤10 lines)
2. **Changes** — files and diffs
3. **Tests** — new/updated tests
4. **Code** — minimal implementation
5. **Notes** — short rationale

---

## References

* @CLAUDE.md
* @docs/coding-guidelines.md
