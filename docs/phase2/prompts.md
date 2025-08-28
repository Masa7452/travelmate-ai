# Phase 2 Prompts — Travelmate AI (Port & Adapter Formalization)
*Version: 2025-08-27*

**Goal of Phase 2**  
Refactor internals to a clean **Port & Adapter** design without changing any API I/O or E2E behavior. Introduce repositories as **ports** in domain layer, formalize current in-memory logic as **adapters** in infrastructure layer, and enable future DB switching via environment variables.

**NON-BREAKING REFACTOR PRINCIPLE**: All existing tests must remain green. API I/O is immutable.

---

## Ground Rules (from `./CLAUDE.md`)
- **TDD**: Red → Green → Refactor. Write failing tests first for new units/ports.
- **AAA**: Arrange / Act / Assert.
- **Types**: No `any`/`unknown`. Prefer exact, immutable types (`readonly` helpful).
- **Loops**: No `for`/`forEach`. Prefer `map`/`filter`/`reduce` and pure functions.
- **Style**: Arrow functions only; explicit return types on exported fns.
- **UseCase Naming**: Files MUST end with `.usecase.ts`. Export names in PascalCase.
- **JSDoc**: Required for public UseCases/Ports with `@fileoverview`, `@param`, `@returns`, `@throws`
- **Tests**: Deterministic (use fake timers), ApplicationUnit with DI, API with Zod & mapErrorToStatus assertions
- **Diffs**: Small, focused PRs with Conventional Commits (+ short "why").
- **Discipline**: Stop after **max 3 attempts or 30 minutes**; report attempts, errors, hypotheses, next options.
- **DoD (per PR)**: tests green, lint/type clean, contracts documented, minimal diff, rationale present.
- **Testing framework**: **Vitest** (use `vi.spyOn`, `vi.mock`, etc.).

---

## Step 0 — Repository Port Interfaces (Types Only)
**Prompt**

    /implement_step "First, review CLAUDE.md to understand project rules and conventions. Then create repository port interfaces only:
    GUARD: This is NON-BREAKING refactor - preserve all existing behavior
    - src/Core/Domain/Ports/ItineraryRepository.ts: interface with save(itinerary) -> {id}, findById(id) -> Itinerary|undefined
    - src/Core/Domain/Ports/TripsRepository.ts: interface with list() -> MyTripCard[], add(card) -> void, remove(id) -> boolean (returns true if deleted, false if not found)
    Add comprehensive JSDoc including error conditions (NotFoundError, ValidationError).
    Add @fileoverview describing port purpose and invariants.
    Ensure consistent placement in src/Core/Domain/Ports/ directory.
    Output 'All done' when complete."

**Stop Conditions**: Interface definitions only; no implementations. API I/O remains unchanged.  
**Done Criteria**: Port interfaces compile with full JSDoc.

**次のアクション**: `pnpm run check`を実行して型定義エラーがないことを確認してからStep 1に進む。

---

## Step 1 — Port-based Unit Tests (Failing)
**Prompt**

    /write_tests unit "First, review CLAUDE.md to understand project rules and conventions. Then create failing tests for repository ports:
    - ItineraryRepository.save should generate and return id, store immutable copy
    - ItineraryRepository.findById should return stored itinerary or undefined
    - TripsRepository.list should return all stored cards as readonly array
    - TripsRepository.add should store immutable copy of the card
    - TripsRepository.remove should remove card by id and return boolean (true if deleted, false if not found)
    Test immutability (modifications to returned objects don't affect stored data).
    Test return values match contract (especially remove returning boolean).
    Use arrow functions only, deterministic tests with fake timers.
    Use Vitest (vi.spyOn, vi.mock) to verify port contract compliance.
    Output 'All done' when complete."

**Stop Conditions**: Do not implement actual repository classes yet. E2E behavior unchanged.  
**Done Criteria**: All port tests fail as expected (Red).

**次のアクション**: `pnpm test`を実行してポートテストが失敗することを確認してからStep 2に進む。

---

## Step 2 — InMemory Adapters (Green Port Tests)
**Prompt**

    /implement_step "First, review CLAUDE.md to understand project rules and conventions. Then formalize InMemory adapters:
    GUARD: Preserve exact behavior from Phase 1 implementations
    - src/Core/Infrastructure/Repositories/Itinerary/repository.ts: implements ItineraryRepository port
    - src/Core/Infrastructure/Repositories/Trips/repository.ts: implements TripsRepository port
    Move existing in-memory logic from Phase 1 locations; ensure deep copy or Object.freeze() for immutability.
    Add JSDoc with @fileoverview describing adapter implementation.
    Output 'All done' when complete."

**Stop Conditions**: Do not modify existing API handlers or use-cases yet. API I/O unchanged.  
**Done Criteria**: Repository port tests pass (Green); existing functionality preserved.

**次のアクション**: `pnpm test`を実行してリポジトリテストが通ることを確認してからStep 3に進む。

---

## Step 3 — DI Provider with ENV Support
**Prompt**

    /implement_step "First, review CLAUDE.md to understand project rules and conventions. Then create provider with ENV toggle:
    - src/Core/Infrastructure/Provider/repository.ts: createRepositories() factory
      - Returns {itineraries: ItineraryRepository, trips: TripsRepository}
      - Check process.env.DB_PROVIDER (default: 'memory' if undefined)
      - For now, always return InMemory implementations
      - Add comment: '// Default to memory if DB_PROVIDER not set'
    - src/Core/Application/Types.ts: export Repositories type = {itineraries, trips}
    - Update .env.example with:
      - DB_PROVIDER=memory
      - DATABASE_URL=
    Add JSDoc describing provider pattern and ENV switching.
    Output 'All done' when complete."

**Stop Conditions**: No use-case modifications yet. Mock 500 functionality preserved.  
**Done Criteria**: Provider creates repositories; ENV variables documented.

**次のアクション**: `pnpm run check`を実行してProvider構造の型チェックが通ることを確認してからStep 4に進む。

---

## Step 4 — Error Taxonomy & Mapping Tests (Failing)
**Prompt**

    /write_tests unit "First, review CLAUDE.md to understand project rules and conventions. Then create failing tests for error handling:
    - Define error taxonomy: NotFoundError, ValidationError, ConflictError, InternalError
    - Test mapErrorToStatus function:
      - NotFoundError -> 404
      - ValidationError -> 422  
      - ConflictError -> 409
      - InternalError/others -> 500
    - Test that use-cases throw appropriate error types
    - Test that API handlers call mapErrorToStatus and return correct HTTP status
    - Test 500 mock injection works on ALL endpoints (?__mock=500 and x-mock-error header)
    - Note: Mock 500 trigger detection is each route.ts's responsibility, not mapErrorToStatus's
    Use vi.spyOn to verify mapErrorToStatus is called with correct error types
    Use arrow functions only, AAA pattern.
    Output 'All done' when complete."

**Stop Conditions**: Do not implement error classes or mapping yet.  
**Done Criteria**: Error mapping tests fail as expected (Red).

**次のアクション**: `pnpm test`を実行してエラーマッピングテストが失敗することを確認してからStep 5に進む。

---

## Step 5 — Error Implementation & Use-case DI (Green)
**Prompt**

    /implement_step "First, review CLAUDE.md to understand project rules and conventions. Then implement error handling and DI:
    GUARD: API I/O must remain unchanged - same status codes and response shapes
    - src/Core/Application/Errors.ts: Define NotFoundError, ValidationError classes with JSDoc
    - Update src/Shared/ErrorMapping.ts: Enhance mapErrorToStatus with error taxonomy
    - Refactor ALL use-cases to accept repos parameter:
      - src/Core/Application/UseCases/CreateItinerary.usecase.ts: (repos: Repositories, input: {query:string}) => {id: string}
      - src/Core/Application/UseCases/GetItinerary.usecase.ts: (repos: Repositories, id: string) => Itinerary (throw NotFoundError if not found)
      - Apply same pattern to all *.usecase.ts files
    Keep existing logic intact; only add DI parameter and proper error types.
    Maintain UseCase naming rule: files end with .usecase.ts, exports are PascalCase.
    Update JSDoc with @param repos added to all functions.
    Output 'All done' when complete."

**Stop Conditions**: Do not modify API handlers yet. All existing tests should still pass.  
**Done Criteria**: DI use-case tests and error mapping tests pass.

**次のアクション**: `pnpm test`を実行してDI対応とエラーマッピングのテストが通ることを確認してからStep 6に進む。

---

## Step 6 — Itinerary API Handler Migration
**Prompt**

    /implement_step "First, review CLAUDE.md to understand project rules and conventions. Then migrate itinerary API handlers:
    GUARD: src/app/** paths are READ-ONLY - API I/O shapes must not change
    - /api/itineraries/route.ts (POST): 
      - Call CreateItinerary.usecase via createRepositories()
      - Use mapErrorToStatus for all error responses
      - Preserve both mock 500 triggers: ?__mock=500 and x-mock-error: internal
      - Return exactly {id:string} as before
    - /api/itineraries/[id]/route.ts (GET):
      - Call GetItinerary.usecase via createRepositories()
      - Use mapErrorToStatus for error mapping
      - Return exact Itinerary shape as before
    Keep all HTTP status codes and response bodies identical; validate with Zod at boundaries.
    Output 'All done' when complete."

**Stop Conditions**: Only migrate itinerary endpoints. E2E tests must remain green.  
**Done Criteria**: Itinerary API tests pass; no behavioral changes.

**次のアクション**: `pnpm test`を実行して旅程関連APIテストが通ることを確認してからStep 7に進む。

---

## Step 7 — Trips Use-cases with DI (Implementation)
**Prompt**

    /implement_step "First, review CLAUDE.md to understand project rules and conventions. Then ensure all trips use-cases have DI:
    - src/Core/Application/UseCases/GetPublicPlans.usecase.ts: (repos: Repositories) => PublicPlanCard[]
    - src/Core/Application/UseCases/ListTrips.usecase.ts: (repos: Repositories) => MyTripCard[]
    - src/Core/Application/UseCases/AddTrip.usecase.ts: (repos: Repositories, {id, title}) => MyTripCard
    - src/Core/Application/UseCases/DeleteTrip.usecase.ts: (repos: Repositories, id: string) => boolean (returns result from repository)
    Extract existing logic from current implementations; add proper error types.
    All use-case signatures follow pattern: (repos: Repositories, ...params) => ReturnType
    Maintain .usecase.ts naming convention.
    Update index.ts to re-export all use cases.
    Add/update JSDoc with @param repos for all functions.
    Output 'All done' when complete."

**Stop Conditions**: Do not migrate API handlers yet.  
**Done Criteria**: Trips use-case tests pass.

**次のアクション**: `pnpm test`を実行してTrips用のユースケーステストが通ることを確認してからStep 8に進む。

---

## Step 8 — All API Handlers Migration
**Prompt**

    /implement_step "First, review CLAUDE.md to understand project rules and conventions. Then complete API migration:
    GUARD: src/app/** and API I/O are READ-ONLY - preserve exact behavior
    - /api/explore/route.ts (GET): call GetPublicPlans.usecase via createRepositories()
    - /api/my-trips/route.ts (GET/POST): call ListTrips.usecase/AddTrip.usecase via createRepositories()
    - /api/my-trips/[id]/route.ts (DELETE): call DeleteTrip.usecase via createRepositories()
    All handlers must:
    - Use mapErrorToStatus for error responses
    - Support both mock 500 triggers (?__mock=500 and x-mock-error: internal)
    - Validate input with Zod parse, output with safeParse
    - Return EXACT same response shapes as Phase 1
    Keep all HTTP behaviors identical.
    Output 'All done' when complete."

**Stop Conditions**: No UI changes. All existing tests must pass.  
**Done Criteria**: All API tests pass; mock 500 works on all endpoints.

**次のアクション**: `pnpm run check && pnpm test`を実行してすべてのAPIテストが通ることを確認してからStep 9に進む。

---

## Step 9 — Explore-Plan ID Consistency E2E
**Prompt**

    /write_tests e2e "First, review CLAUDE.md to understand project rules and conventions. Then add E2E test for Explore-Plan consistency:
    - Seed test data: Before tests, populate InMemoryItineraryRepository with sample itineraries via API or direct injection
    - Test that Explore page card IDs correspond to actual seeded itineraries
    - Test clicking an Explore card successfully navigates to Plan Detail
    - Test 404 handling when navigating to non-existent plan ID
    - Document seeding strategy used (API calls vs direct repository access)
    - Use exact data-testid attributes from Phase 1
    Use Playwright, deterministic tests.
    Output 'All done' when complete."

**Stop Conditions**: Do not modify UI components unless necessary for test passage.  
**Done Criteria**: Explore-Plan consistency E2E tests pass.

**次のアクション**: `pnpm run test:e2e`を実行してExplore-Plan整合性テストが通ることを確認してからStep 10に進む。

---

## Step 10 — Documentation & Final Verification
**Prompt**

    /implement_step "First, review CLAUDE.md to understand project rules and conventions. Then finalize Phase 2:
    - Update Architecture.md with:
      - Port & Adapter diagram showing src/Core/Domain/Ports and src/Core/Infrastructure/Repositories
      - Repository switching via ENV variables (DB_PROVIDER)
      - Error taxonomy and mapping table
    - Update README.md:
      - Note InMemory limitations (data loss on restart)
      - Document ENV configuration (DB_PROVIDER defaults to 'memory')
    - Verify full test suite: pnpm run check && pnpm test && pnpm run test:e2e
    - Verify ALL existing tests remain green (non-breaking refactor confirmed)
    - Remove any unused imports or dead code
    Output 'All done' when complete."

**Stop Conditions**: No functional changes; documentation and cleanup only.  
**Done Criteria**: All tests pass; API I/O unchanged; architecture documented.

**次のアクション**: `pnpm run check && pnpm test && pnpm run test:e2e`を実行して全スイートがグリーンであり、E2E動作が変わっていないことを確認する。

---

## Phase 2 Complete!

**Acceptance Criteria Checklist:**
- ✅ All existing tests remain green (non-breaking refactor)
- ✅ Port type definitions in `@core/Domain/Ports/`
- ✅ InMemory adapters in `@core/Infrastructure/Repositories/<Feature>/repository.ts`
- ✅ DI provider in `@core/Infrastructure/Provider/repository.ts` with createRepositories() function
- ✅ Error taxonomy with mapErrorToStatus pure function (ValidationError→422, NotFoundError→404, others→500)
- ✅ All API handlers use repositories via DI
- ✅ Mock 500 works on all endpoints (both query and header)
- ✅ UseCase naming convention maintained (.usecase.ts)
- ✅ JSDoc for all public UseCases/Ports
- ✅ Explore-Plan ID consistency verified
- ✅ Documentation updated with architecture
- ✅ API I/O completely unchanged