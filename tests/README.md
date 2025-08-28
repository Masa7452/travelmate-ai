# E2E Tests

This directory contains end-to-end tests using Playwright.

## Structure

- `e2e/` - E2E test files
  - `main-flow.e2e.ts` - Home -> Create itinerary -> Plan detail flow
  - `save-flow.e2e.ts` - Save to My Trips flow
  - `explore-flow.e2e.ts` - Explore page display
  - `delete-flow.e2e.ts` - Delete trip from My Trips
- `fixtures/` - Shared test data and utilities
  - `test-data.ts` - Deterministic test data

## Running Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e tests/e2e/main-flow.e2e.ts

# Run with UI mode (interactive)
pnpm playwright test --ui

# Debug mode
pnpm playwright test --debug
```

## Required data-testid Attributes

The tests expect these data-testid attributes in the UI:

### Plan Detail Page
- `sourceQuery-banner` - Displays the original query
- `timeline` - Container for itinerary segments
- `segment-*` - Individual segment items
- `save-to-mytrips` - Save button

### Explore Page
- `explore-list` - Container for plan cards
- `plan-card-{id}` - Individual plan card
- `card-title` - Card title element
- `card-days` - Optional days display
- `empty-explore-message` - Empty state

### My Trips Page
- `mytrips-list` - Container for saved trips
- `delete-trip` - Delete button with `data-trip-id` attribute
- `empty-trips-message` - Empty state

### Common
- `error-message` - Error display
- `confirm-dialog` - Confirmation dialogs
- `cancel-button` / `confirm-button` - Dialog actions

## Notes

- Tests are written to fail initially (TDD approach)
- Uses AAA pattern (Arrange, Act, Assert)
- Follows CLAUDE.md naming convention: `should_<business_rule>`
- No authentication required in Phase 1