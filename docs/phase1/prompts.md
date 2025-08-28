# Phase 1 Prompts — Travelmate AI (Full Implementation with UI Migration)
*Version: 2025-08-27*

**Goal of Phase 1**  
MVPとして**すべての `/api/*` エンドポイントをInMemoryで本実装**し、**create-xyzの4画面をApp Routerへ移植**して、ユーザーが「自然文→旅程生成→詳細確認→保存→管理」の一連の体験ができる状態を提供する。

---

## Ground Rules (from `./CLAUDE.md`)
- **TDD**: Red → Green → Refactor. Always write failing tests first.
- **AAA**: Arrange / Act / Assert in tests.
- **Types**: No `any`/`unknown`. Prefer exact, immutable types (`readonly` where helpful).
- **Loops**: No `for`/`forEach`. Prefer `map`/`filter`/`reduce` and pure functions.
- **Style**: Arrow functions only; explicit return types on exported fns.
- **UseCase Naming**: Files MUST end with `.usecase.ts`. Export names in PascalCase (e.g., `CreateItinerary`)
- **JSDoc**: Required for public UseCases/Ports with `@fileoverview`, `@param`, `@returns`, `@throws`
- **Tests**: Deterministic (use fake timers), ApplicationUnit with DI, API with Zod & mapErrorToStatus assertions
- **Diffs**: Small, focused PRs with Conventional Commits (+ short "why" in body).
- **Discipline**: Stop after **max 3 attempts or 30 minutes** of being stuck; report attempts, errors, hypotheses, next options.
- **DoD (per PR)**: tests green, lint/type clean, contracts documented, minimal diff, rationale present.
- **Testing framework**: **Vitest** (use `vi.spyOn`, `vi.mock`, etc.).

---

## Step 0 — Scaffold & Placeholders
**Prompt**

    /implement_step "First, review CLAUDE.md to understand project rules and conventions. Then create folders and empty files only (no logic):
    GUARD: src/app/** paths are READ-ONLY (no rename/change to preserve URLs)
    - src/app/page.tsx
    - src/app/plan/[id]/page.tsx
    - src/app/explore/page.tsx
    - src/app/my-trips/page.tsx
    - src/app/api/itineraries/route.ts
    - src/app/api/itineraries/[id]/route.ts
    - src/app/api/explore/route.ts
    - src/app/api/my-trips/route.ts
    - src/app/api/my-trips/[id]/route.ts
    - src/Shared/Contracts.ts
    - src/Shared/ErrorMapping.ts
    Output 'All done' when complete."

**Stop Conditions**: No JSX/logic; empty modules only.  
**Done Criteria**: `pnpm run check` passes (type/lint ok with empty stubs).

**次のアクション**: `pnpm run check`を実行して型チェックとlintが通ることを確認してからStep 1に進む。

---

## Step 1 — Contracts & Error Mapping
**Prompt**

    /implement_step "First, review CLAUDE.md to understand project rules and conventions. Then define domain contracts, API I/O and error mapping:
    GUARD: API I/O is READ-ONLY - no changes to request/response shapes
    - src/Shared/Contracts.ts:
      - Itinerary, Day, Segment, SegmentKind('poi'|'move'|'meal'|'buffer')
      - PublicPlanCard, MyTripCard
      - Comprehensive Zod schemas for ALL types (itinerarySchema, publicPlanCardSchema, myTripCardSchema, etc.)
    - src/Shared/ErrorMapping.ts:
      - Unified error mapping: ValidationError→422, NotFoundError→404, others→500
      - Export pure mapErrorToStatus(error: Error): number function (Error→HTTPステータス変換)
      - Note: Mock 500 trigger detection (?__mock=500 / x-mock-error: internal) is each route.ts's responsibility
    - Add TSDoc with @fileoverview for every module
    - In each API route file, add a top block comment with exact Request/Response/Errors.
    Output 'All done' when complete."

**Stop Conditions**: No implementation beyond types/schemas/error utilities.  
**Done Criteria**: Types compile; Zod schemas validate correctly; Error mapping table complete.

**次のアクション**: `pnpm run check`を実行して型エラーがないことを確認してからStep 2に進む。

---

## Step 2 — Unit Tests (Failing)
**Prompt**

    /write_tests unit "First, review CLAUDE.md to understand project rules and conventions. Then create failing unit tests:
    Domain Layer:
    - Itinerary validation and construction with exact types
    - Segment type validation (poi/move/meal/buffer)
    Application Layer (with DI mocking):
    - CreateItinerary.usecase.ts: (repos, input) -> { id }
    - GetItinerary.usecase.ts: (repos, id) -> Itinerary
    Infrastructure Layer:
    - PlannerStub: returns schema-valid itinerary (deterministic)
    - InMemoryItineraryRepository: save/findById with immutability (deep copy)
    - InMemoryTripsRepository: list/add/remove operations
    Test that files are at correct paths:
    - @core/Infrastructure/Services/PlannerStub
    - @core/Infrastructure/Repositories/Itinerary/repository
    - @core/Infrastructure/Repositories/Trips/repository
    Use AAA pattern, arrow functions only, fake timers for determinism.
    Output 'All done' when complete."

**Stop Conditions**: Do not implement the actual functions.  
**Done Criteria**: Unit tests fail as expected (Red phase of TDD).

**次のアクション**: `pnpm test`を実行して単体テストが失敗することを確認してからStep 3に進む。

---

## Step 3 — API Tests (Failing)
**Prompt**

    /write_tests api "First, review CLAUDE.md to understand project rules and conventions. Then create failing tests for ALL API endpoints:
    GUARD: API I/O shapes are READ-ONLY - test exact contracts
    - POST /api/itineraries: req {query:string} → res {id:string}
      - Test 200, 400, 422, 500 (with ?__mock=500 AND x-mock-error: internal)
    - GET /api/itineraries/[id]: → Itinerary (200), 404
    - GET /api/explore: → PublicPlanCard[] (200, can be empty array)
    - GET /api/my-trips: → MyTripCard[] (200)
    - POST /api/my-trips: req {id:string, title:string} → MyTripCard (200)
    - DELETE /api/my-trips/[id]: → {ok:true} (200)
    Test that ALL errors go through mapErrorToStatus (vi.spyOn assertions)
    Test Zod validation at API boundaries (parse input, safeParse output)
    Use arrow functions only, deterministic tests.
    Output 'All done' when complete."

**Stop Conditions**: Do not implement API handlers.  
**Done Criteria**: API tests fail as expected (Red phase).

**次のアクション**: `pnpm test`を実行してAPIテストが失敗することを確認してからStep 4に進む。

---

## Step 4 — E2E Tests (Failing - All Flows)
**Prompt**

    /write_tests e2e "First, review CLAUDE.md to understand project rules and conventions. Then create failing E2E tests for 4 flows:
    Main Flow:
    - Home → POST /api/itineraries → redirect /plan/{id} → GET renders timeline & sourceQuery
    Save Flow:
    - Plan Detail → click 'Save to My Trips' → POST /api/my-trips → redirect to My Trips
    - My Trips page shows saved trip
    Explore Flow:
    - Navigate to Explore → displays cards from GET /api/explore
    Delete Flow:
    - My Trips → click delete → DELETE /api/my-trips/[id] → item removed
    
    Required data-testid attributes (exact names):
    - sourceQuery-banner, timeline (Plan Detail)
    - save-to-mytrips (Save button)
    - explore-list (Explore cards container)
    - mytrips-list (My Trips container)
    - delete-trip with data-trip-id='{id}' (Delete buttons)
    Use Playwright, deterministic selectors only.
    Output 'All done' when complete."

**Stop Conditions**: Do not implement UI components.  
**Done Criteria**: E2E tests fail as expected (Red phase).

**次のアクション**: `pnpm run test:e2e`を実行してE2Eテストが失敗することを確認してからStep 5に進む。

---

## Step 5 — Domain Layer (Green Unit Tests)
**Prompt**

    /implement_step "First, review CLAUDE.md to understand project rules and conventions. Then implement domain layer:
    - src/Core/Domain/Itinerary.ts: Itinerary aggregate with construct/validate methods
    - src/Core/Domain/Segment.ts: SegmentKind union and Segment validation
    - src/Core/Domain/Types.ts: Core value objects (Day, PublicPlanCard, MyTripCard)
    - Keep immutable with readonly properties
    - All validations should use Zod schemas from src/Shared/Contracts.ts
    - Add JSDoc with @fileoverview describing domain invariants
    Output 'All done' when complete."

**Stop Conditions**: No application or infrastructure layer yet.  
**Done Criteria**: Domain unit tests pass (Green phase).

**次のアクション**: `pnpm test`を実行してドメイン関連のテストが通ることを確認してからStep 6に進む。

---

## Step 6 — Application Layer (Green Use Cases)
**Prompt**

    /implement_step "First, review CLAUDE.md to understand project rules and conventions. Then implement application use cases:
    GUARD: src/app/** paths are READ-ONLY, API I/O contracts are immutable
    - @core/Application/UseCases/CreateItinerary.usecase.ts: (repos: Repositories, input: {query:string}) => {id:string}
    - @core/Application/UseCases/GetItinerary.usecase.ts: (repos: Repositories, id:string) => Itinerary (throw NotFoundError)
    - @core/Application/UseCases/GetPublicPlans.usecase.ts: (repos: Repositories) => PublicPlanCard[]
    - @core/Application/UseCases/ListTrips.usecase.ts: (repos: Repositories) => MyTripCard[]
    - @core/Application/UseCases/AddTrip.usecase.ts: (repos: Repositories, {id,title}) => MyTripCard
    - @core/Application/UseCases/DeleteTrip.usecase.ts: (repos: Repositories, id:string) => boolean
    - @core/Application/UseCases/index.ts: re-export all use cases
    - MUST follow naming: files end with .usecase.ts, exports are PascalCase
    - Add JSDoc with @param repos, @returns, @throws
    - Keep functions pure with explicit return types
    - Use dependency injection for repositories
    Output 'All done' when complete."

**Stop Conditions**: No infrastructure implementation yet.  
**Done Criteria**: Application layer unit tests pass (with DI mocking).

**次のアクション**: `pnpm test`を実行してアプリケーション層のテストが通ることを確認してからStep 7に進む。

---

## Step 7 — Infrastructure (Green Tests)
**Prompt**

    /implement_step "First, review CLAUDE.md to understand project rules and conventions. Then implement infrastructure:
    - src/Core/Infrastructure/Services/PlannerStub.ts: builds schema-valid itinerary from query
      - Fallback to template on failure
      - Must return valid Itinerary matching Zod schema
    - @core/Infrastructure/Repositories/Itinerary/repository.ts: InMemoryItineraryRepository class
      - save(itinerary): Promise<void>
      - findById(id): Promise<Itinerary | undefined>
      - Use deep copy for immutability
    - @core/Infrastructure/Repositories/Trips/repository.ts: InMemoryTripsRepository class
      - list(): MyTripCard[]
      - add(card): void
      - remove(id): boolean
    Output 'All done' when complete."

**Stop Conditions**: No API handler implementation yet.  
**Done Criteria**: Infrastructure tests pass.

**次のアクション**: `pnpm test`を実行してインフラ層のテストが通ることを確認してからStep 8に進む。

---

## Step 8 — API Handlers (Green API Tests)
**Prompt**

    /implement_step "First, review CLAUDE.md to understand project rules and conventions. Then implement ALL API handlers:
    GUARD: API I/O shapes are READ-ONLY - no changes allowed
    POST /api/itineraries:
    - Parse input {query:string} with Zod, call CreateItinerary.usecase
    - Support ?__mock=500 AND x-mock-error: internal for 500 injection
    - Return exactly {id:string} on success
    
    GET /api/itineraries/[id]:
    - Call GetItinerary.usecase from @core/Application/UseCases/
    - Return full Itinerary or 404 (via mapErrorToStatus)
    
    GET /api/explore:
    - Call GetPublicPlans.usecase
    - Return PublicPlanCard[] (empty array is valid)
    
    GET /api/my-trips:
    - Call ListTrips.usecase
    - Return MyTripCard[]
    
    POST /api/my-trips:
    - Parse {id:string, title:string} with Zod
    - Call AddTrip.usecase
    - Return created MyTripCard
    
    DELETE /api/my-trips/[id]:
    - Call DeleteTrip.usecase
    - Return exactly {ok:true}
    
    All handlers MUST use @shared/ErrorMapping.ts mapErrorToStatus pure function for status codes.
    Note: Mock 500 trigger detection is each route.ts's responsibility, not ErrorMapping's.
    All inputs MUST use Zod parse(), outputs use safeParse().
    Output 'All done' when complete."

**Stop Conditions**: No UI implementation yet. API I/O must remain unchanged.
**Done Criteria**: All API tests pass with exact contract compliance.

**次のアクション**: `pnpm test`を実行してAPIテストが通ることを確認してからStep 9に進む。

---

## Step 9 — Home Page (create-xyz Migration)
**Prompt**

    /implement_step "First, review CLAUDE.md to understand project rules and conventions. Then migrate Home page from create-xyz:
    GUARD: src/app/page.tsx path is READ-ONLY (preserve URL structure)
    Reference: apps/web/src/app/page.jsx
    
    Implement in src/app/page.tsx:
    - Hero section with compelling copy
    - Natural language input textarea
    - Example query chips (clickable to populate input)
    - Loading states and error handling
    - POST to /api/itineraries with {query:string} on submit
    - Redirect to /plan/{id} on success
    - Add data-testid='home-input' and 'home-submit'
    - Preserve accessibility attributes (aria-*)
    - Remove all mock arrays - use actual API
    Output 'All done' when complete."

**Stop Conditions**: Only implement Home page. Do not modify URL structure.
**Done Criteria**: Home page works with real API.

**次のアクション**: `pnpm run dev`でアプリを起動してHome画面が動作することを確認してからStep 10に進む。

---

## Step 10 — Plan Detail Page (create-xyz Migration)
**Prompt**

    /implement_step "First, review CLAUDE.md to understand project rules and conventions. Then migrate Plan Detail page:
    Reference: apps/web/src/app/plan/page.jsx
    
    Implement in src/app/plan/[id]/page.tsx:
    - For Next.js 15: params: Promise<{ id: string }> must be awaited in handler
    - Fetch from GET /api/itineraries/{id}
    - Display sourceQuery banner at top (data-testid='sourceQuery-banner')
    - Render timeline with day/segment structure (data-testid='timeline')
    - Show segment types distinctly (poi/move/meal/buffer)
    - Add 'Save to My Trips' button (data-testid='save-to-mytrips')
      - POST to /api/my-trips with {id, title}
      - Show success message after save
    - Handle 404 gracefully
    - Preserve visual design from create-xyz
    Output 'All done' when complete."

**Stop Conditions**: Focus on Plan Detail only.  
**Done Criteria**: Plan page displays fetched data correctly.

**次のアクション**: `pnpm run test:e2e`を実行して基本フローのE2Eテストが通ることを確認してからStep 11に進む。

---

## Step 11 — Explore Page (create-xyz Migration)
**Prompt**

    /implement_step "First, review CLAUDE.md to understand project rules and conventions. Then migrate Explore page:
    Reference: apps/web/src/app/explore/page.jsx
    
    Implement in src/app/explore/page.tsx:
    - Fetch from GET /api/explore
    - Display cards in grid layout (data-testid='explore-list')
    - Preserve filter UI (can be non-functional in Phase 1)
    - Each card links to /plan/{id}
    - Handle empty state gracefully
    - Loading and error states
    - Remove all mock arrays - use actual API
    Output 'All done' when complete."

**Stop Conditions**: Filters can be visual-only for Phase 1.  
**Done Criteria**: Explore page fetches and displays real data.

**次のアクション**: `pnpm run dev`でExplore画面が実APIで動作することを確認してからStep 12に進む。

---

## Step 12 — My Trips Page (create-xyz Pattern)
**Prompt**

    /implement_step "First, review CLAUDE.md to understand project rules and conventions. Then implement My Trips page:
    Following create-xyz UX patterns
    
    Implement in src/app/my-trips/page.tsx:
    - Fetch from GET /api/my-trips
    - Display saved trips in list/grid (data-testid='mytrips-list')
    - Each item shows title, createdAt
    - Delete button for each (data-testid='delete-trip' data-trip-id='{id}')
      - DELETE /api/my-trips/{id} on click
      - Optimistic UI update
    - Empty state message
    - Link each card to /plan/{id}
    - Loading and error states
    Output 'All done' when complete."

**Stop Conditions**: Authentication/user filtering is Phase 2.  
**Done Criteria**: My Trips page with working delete.

**次のアクション**: `pnpm run dev`でMy Trips画面の表示と削除が動作することを確認してからStep 13に進む。

---

## Step 13 — Navigation & Polish
**Prompt**

    /implement_step "First, review CLAUDE.md to understand project rules and conventions. Then add navigation and polish:
    - Add top navigation bar with links to all pages
    - Ensure Save button feedback in Plan Detail
    - Add success toasts/messages for user actions
    - Verify all data-testid attributes are in place
    - Clean up any remaining console.logs
    - Update layout.tsx with proper metadata
    Output 'All done' when complete."

**Stop Conditions**: Keep navigation simple.  
**Done Criteria**: All pages are navigable.

**次のアクション**: 全画面間のナビゲーションが機能することを確認してからStep 14に進む。

---

## Step 14 — Complete E2E Tests (Green)
**Prompt**

    /implement_step "First, review CLAUDE.md to understand project rules and conventions. Then ensure all E2E tests pass:
    - Home -> Plan flow
    - Plan -> Save -> My Trips flow  
    - Explore page display
    - My Trips delete flow
    - Fix any failing assertions
    - Add missing data-testid if needed
    - Ensure stable selectors
    Output 'All done' when complete."

**Stop Conditions**: Don't add new test scenarios.  
**Done Criteria**: All E2E tests pass.

**次のアクション**: `pnpm run test:e2e`ですべてのE2Eテストが通ることを確認してからStep 15に進む。

---

## Step 15 — Cleanup & Documentation
**Prompt**

    /implement_step "First, review CLAUDE.md to understand project rules and conventions. Then final cleanup:
    - Remove any create-xyz import statements
    - Delete unused mock data files
    - Update README.md with:
      - How to run the app
      - InMemory limitation notice
      - Available features in Phase 1
    - Ensure all tests pass: pnpm run check && pnpm test && pnpm run test:e2e
    - Verify no 'any' types remain
    - Check ErrorMapping.ts is used consistently
    Output 'All done' when complete."

**Stop Conditions**: No new features.  
**Done Criteria**: Clean codebase, all tests green.

**次のアクション**: `pnpm run check && pnpm test && pnpm run test:e2e`で全てグリーンを確認。

---

## Phase 1 Complete!

**Acceptance Criteria Checklist:**
- ✅ All `/api/*` endpoints implemented with InMemory storage (exact I/O preserved)
- ✅ 4 pages migrated from create-xyz to App Router
- ✅ No mock arrays in UI - all data from APIs
- ✅ All tests passing (Unit with DI, API with Zod & mapErrorToStatus, E2E with 4 flows)
- ✅ Consistent error handling via src/Shared/ErrorMapping.ts
- ✅ Zod validation at all API boundaries (parse input, safeParse output)
- ✅ UseCase naming convention (.usecase.ts files, PascalCase exports)
- ✅ JSDoc for all public UseCases/Ports
- ✅ P95 ≤ 10s performance
- ✅ Documentation updated

**次のアクション**: Phase 2 へ進む準備完了！