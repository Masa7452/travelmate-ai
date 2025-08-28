import { test, expect } from '@playwright/test';

import { testData } from '../fixtures/test-data';

test.describe('Main Flow: Home -> Create Itinerary -> Plan Detail', () => {
  test('should_create_itinerary_and_redirect_to_plan_detail', async ({ page }) => {
    // Arrange
    const query = testData.mainFlow.query;

    // Act - Navigate to home page
    await page.goto('/');
    
    // Act - Fill in the query form
    await page.fill('input[name="query"]', query);
    
    // Act - Submit form and wait for API call
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/itineraries') && response.request().method() === 'POST',
      { timeout: testData.timeouts.apiCall }
    );
    
    await page.click('button[type="submit"]');
    const apiResponse = await responsePromise;
    
    // Assert - Check API response
    expect(apiResponse.status()).toBe(200);
    const responseData = await apiResponse.json();
    expect(responseData).toHaveProperty('id');
    
    // Assert - Check redirect to plan detail page
    await page.waitForURL(`/plan/${responseData.id}`, { 
      timeout: testData.timeouts.navigation 
    });
    
    // Assert - Check sourceQuery banner is displayed
    const sourceQueryBanner = page.locator('[data-testid="sourceQuery-banner"]');
    await expect(sourceQueryBanner).toBeVisible();
    await expect(sourceQueryBanner).toContainText(query);
    
    // Assert - Check timeline is displayed
    const timeline = page.locator('[data-testid="timeline"]');
    await expect(timeline).toBeVisible();
  });

  test('should_display_timeline_with_segments', async ({ page }) => {
    // Arrange - Navigate directly to a plan page
    const itineraryId = 'itinerary_123456';
    
    // Act
    await page.goto(`/plan/${itineraryId}`);
    
    // Act - Wait for GET API call
    const responsePromise = page.waitForResponse(
      response => response.url().includes(`/api/itineraries/${itineraryId}`) && response.request().method() === 'GET',
      { timeout: testData.timeouts.apiCall }
    );
    
    const apiResponse = await responsePromise;
    
    // Assert - Check API response
    expect(apiResponse.status()).toBe(200);
    
    // Assert - Check timeline is visible
    const timeline = page.locator('[data-testid="timeline"]');
    await expect(timeline).toBeVisible();
  });

  test('should_handle_invalid_itinerary_id', async ({ page }) => {
    // Arrange
    const invalidId = 'invalid-id-format';
    
    // Act
    await page.goto(`/plan/${invalidId}`);
    
    // Act - Wait for GET API call
    const responsePromise = page.waitForResponse(
      response => response.url().includes(`/api/itineraries/${invalidId}`) && response.request().method() === 'GET',
      { timeout: testData.timeouts.apiCall }
    );
    
    const apiResponse = await responsePromise;
    
    // Assert - Check API returns 404
    expect(apiResponse.status()).toBe(404);
    
    // Assert - API returned 404 (no UI assertion needed)
  });
});