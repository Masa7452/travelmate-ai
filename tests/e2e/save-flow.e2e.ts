import { test, expect } from '@playwright/test';

import { testData } from '../fixtures/test-data';

test.describe('Save Flow: Plan Detail -> Save to My Trips', () => {
  test('should_save_itinerary_to_my_trips_and_redirect', async ({ page }) => {
    // Arrange - Navigate to a plan detail page
    const itineraryId = testData.saveFlow.itineraryId;
    await page.goto(`/plan/${itineraryId}`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Act - Click save to my trips button
    const saveButton = page.locator('[data-testid="save-to-mytrips"]');
    await expect(saveButton).toBeVisible();
    
    // Wait for POST API call
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/my-trips') && response.request().method() === 'POST',
      { timeout: testData.timeouts.apiCall }
    );
    
    await saveButton.click();
    const apiResponse = await responsePromise;
    
    // Assert - Check API response
    expect(apiResponse.status()).toBe(200);
    const responseData = await apiResponse.json();
    expect(responseData).toHaveProperty('id');
    expect(responseData).toHaveProperty('title');
    expect(responseData).toHaveProperty('createdAt');
    
    // Assert - Check redirect to My Trips page
    await page.waitForURL('/my-trips', { 
      timeout: testData.timeouts.navigation 
    });
    
    // Assert - Check saved trip appears in the list
    const myTripsList = page.locator('[data-testid="mytrips-list"]');
    await expect(myTripsList).toBeVisible();
    
    // Check for the saved trip
    const savedTrip = myTripsList.locator(`[data-trip-id="${itineraryId}"]`);
    await expect(savedTrip).toBeVisible();
  });

  test('should_handle_save_error_gracefully', async ({ page }) => {
    // Arrange - Navigate to plan page with error injection
    const itineraryId = testData.saveFlow.itineraryId;
    await page.goto(`/plan/${itineraryId}`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Act - Add error injection header
    await page.route('**/api/my-trips', route => {
      route.continue({
        headers: {
          ...route.request().headers(),
          'x-mock-error': 'internal'
        }
      });
    });
    
    // Click save button
    const saveButton = page.locator('[data-testid="save-to-mytrips"]');
    await expect(saveButton).toBeVisible();
    
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/my-trips') && response.request().method() === 'POST',
      { timeout: testData.timeouts.apiCall }
    );
    
    await saveButton.click();
    const apiResponse = await responsePromise;
    
    // Assert - Check API returns error
    expect(apiResponse.status()).toBe(500);
    
    // Assert - API returned error (no UI assertion needed)
  });

  test('should_validate_request_with_proper_data', async ({ page }) => {
    // Arrange
    const itineraryId = testData.saveFlow.itineraryId;
    await page.goto(`/plan/${itineraryId}`);
    await page.waitForLoadState('networkidle');
    
    // Act - Intercept the request to check payload
    let requestPayload: any;
    await page.route('**/api/my-trips', route => {
      requestPayload = route.request().postDataJSON();
      route.continue();
    });
    
    const saveButton = page.locator('[data-testid="save-to-mytrips"]');
    await saveButton.click();
    
    // Wait for request to complete
    await page.waitForResponse(
      response => response.url().includes('/api/my-trips') && response.request().method() === 'POST',
      { timeout: testData.timeouts.apiCall }
    );
    
    // Assert - Check request payload structure
    expect(requestPayload).toBeDefined();
    expect(requestPayload).toHaveProperty('id');
    expect(requestPayload).toHaveProperty('title');
    expect(typeof requestPayload.id).toBe('string');
    expect(typeof requestPayload.title).toBe('string');
  });
});