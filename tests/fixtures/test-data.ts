/**
 * Shared test data for E2E tests
 * Following CLAUDE.md: deterministic data, no randomness
 */

export const testData = {
  // Main flow test data
  mainFlow: {
    query: "5 day trip to Tokyo in March 2024",
    expectedTitle: "Tokyo 5-day Trip",
  },

  // Save flow test data
  saveFlow: {
    itineraryId: "itinerary_test123",
    customTitle: "My Amazing Tokyo Adventure",
  },

  // Explore flow test data
  exploreFlow: {
    expectedCardCount: 3, // Minimum expected cards
  },

  // Delete flow test data
  deleteFlow: {
    tripId: "itinerary_delete123",
    tripTitle: "Trip to Delete",
  },

  // Common timeouts
  timeouts: {
    navigation: 30000,
    apiCall: 10000,
  },
} as const;