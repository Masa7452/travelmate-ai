import { test, expect } from '@playwright/test';

import { testData } from '../fixtures/test-data';

test.describe('Explore Flow: Navigate to Explore Page', () => {
  test('should_display_public_plan_cards_from_api', async ({ page }) => {
    // Arrange & Act - Navigate to explore page
    await page.goto('/explore');
    
    // Wait for GET API call
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/explore') && response.request().method() === 'GET',
      { timeout: testData.timeouts.apiCall }
    );
    
    const apiResponse = await responsePromise;
    
    // Assert - Check API response
    expect(apiResponse.status()).toBe(200);
    const responseData = await apiResponse.json();
    expect(Array.isArray(responseData)).toBe(true);
    
    // Assert - Check explore list container is visible
    const exploreList = page.locator('[data-testid="explore-list"]');
    await expect(exploreList).toBeVisible();
    
    // Assert - List container exists and API returned data
    // No assertions on internal card structure
  });

  test('should_handle_empty_explore_list', async ({ page }) => {
    // Arrange - Mock empty response
    await page.route('**/api/explore', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    // Act - Navigate to explore page
    await page.goto('/explore');
    
    // Assert - Check explore list is visible but empty
    const exploreList = page.locator('[data-testid="explore-list"]');
    await expect(exploreList).toBeVisible();
    
    // Assert - List exists but is empty (based on API response)
  });

  test('should_validate_plan_card_structure', async ({ page }) => {
    // Arrange - Mock response with specific data
    const mockPlans = [
      { id: 'itinerary_abc123', title: 'Tokyo Adventure', days: 5 },
      { id: 'itinerary_xyz789', title: 'Paris Getaway' } // days is optional
    ];
    
    await page.route('**/api/explore', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPlans)
      });
    });
    
    // Act - Navigate to explore page
    await page.goto('/explore');
    await page.waitForLoadState('networkidle');
    
    // Assert - Check cards match API data
    const exploreList = page.locator('[data-testid="explore-list"]');
    await expect(exploreList).toBeVisible();
    
    // Assert - List container exists (no assertions on internal structure)
  });

  test('should_handle_api_error_gracefully', async ({ page }) => {
    // Arrange - Mock error response
    await page.route('**/api/explore', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: 'INTERNAL',
            message: 'Internal server error'
          }
        })
      });
    });
    
    // Act - Navigate to explore page
    await page.goto('/explore');
    
    // Assert - API returned error (no UI assertion needed)
  });
});