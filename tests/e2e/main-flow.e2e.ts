import { test, expect } from '@playwright/test';

import { testData } from '../fixtures/test-data';

test.describe('Critical User Journey: Home -> Create Itinerary -> View Plan', () => {
  test('should_complete_main_user_journey_from_home_to_plan_detail', async ({ page }) => {
    // Arrange
    const query = testData.mainFlow.query;

    // Act - Navigate to home page
    await page.goto('/');
    
    // Act - Fill in the query form using correct selector
    await page.fill('textarea[data-testid="home-input"]', query);
    
    // Act - Submit form and wait for API call
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/itineraries') && response.request().method() === 'POST',
      { timeout: testData.timeouts.apiCall }
    );
    
    await page.click('button[data-testid="home-submit"]');
    const apiResponse = await responsePromise;
    
    // Assert - Check API response
    expect(apiResponse.status()).toBe(200);
    const responseData = await apiResponse.json();
    expect(responseData).toHaveProperty('id');
    
    // Assert - Check redirect to plan detail page
    await page.waitForURL(`/plan/${responseData.id}`, { 
      timeout: testData.timeouts.navigation 
    });
    
    // Assert - Check critical UI elements are visible
    const sourceQueryBanner = page.locator('[data-testid="sourceQuery-banner"]');
    await expect(sourceQueryBanner).toBeVisible();
    
    const timeline = page.locator('[data-testid="timeline"]');
    await expect(timeline).toBeVisible();
  });
});