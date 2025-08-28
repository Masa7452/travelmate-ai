import { test, expect } from '@playwright/test';

import { testData } from '../fixtures/test-data';

test.describe('Delete Flow: My Trips -> Delete Trip', () => {
  test('should_delete_trip_and_remove_from_list', async ({ page }) => {
    // Arrange - Mock initial trips data
    const mockTrips = [
      { 
        id: testData.deleteFlow.tripId, 
        title: testData.deleteFlow.tripTitle, 
        createdAt: '2024-03-01T10:00:00Z' 
      },
      { 
        id: 'itinerary_keep123', 
        title: 'Keep This Trip', 
        createdAt: '2024-03-02T10:00:00Z' 
      }
    ];
    
    await page.route('**/api/my-trips', route => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockTrips)
        });
      } else {
        route.continue();
      }
    });
    
    // Act - Navigate to My Trips page
    await page.goto('/my-trips');
    await page.waitForLoadState('networkidle');
    
    // Assert - Check trips list is displayed
    const myTripsList = page.locator('[data-testid="mytrips-list"]');
    await expect(myTripsList).toBeVisible();
    
    // Find the delete button for the specific trip
    const deleteButton = page.locator(`[data-testid="delete-trip"][data-trip-id="${testData.deleteFlow.tripId}"]`);
    await expect(deleteButton).toBeVisible();
    
    // Act - Click delete and wait for API call
    const deleteResponsePromise = page.waitForResponse(
      response => response.url().includes(`/api/my-trips/${testData.deleteFlow.tripId}`) && response.request().method() === 'DELETE',
      { timeout: testData.timeouts.apiCall }
    );
    
    await deleteButton.click();
    const deleteResponse = await deleteResponsePromise;
    
    // Assert - Check API response
    expect(deleteResponse.status()).toBe(200);
    const responseData = await deleteResponse.json();
    expect(responseData).toEqual({ ok: true });
    
    // Assert - Check trip is removed from the list
    const deletedTrip = myTripsList.locator(`[data-trip-id="${testData.deleteFlow.tripId}"]`);
    await expect(deletedTrip).not.toBeVisible();
    
    // Assert - Check other trip still exists
    const remainingTrip = myTripsList.locator('[data-trip-id="itinerary_keep123"]');
    await expect(remainingTrip).toBeVisible();
  });

  test('should_handle_delete_error_gracefully', async ({ page }) => {
    // Arrange - Mock trips and error response
    const mockTrips = [
      { 
        id: testData.deleteFlow.tripId, 
        title: testData.deleteFlow.tripTitle, 
        createdAt: '2024-03-01T10:00:00Z' 
      }
    ];
    
    await page.route('**/api/my-trips', route => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockTrips)
        });
      } else {
        route.continue();
      }
    });
    
    await page.route(`**/api/my-trips/${testData.deleteFlow.tripId}`, route => {
      if (route.request().method() === 'DELETE') {
        route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            error: {
              code: 'NOT_FOUND',
              message: 'Trip not found'
            }
          })
        });
      } else {
        route.continue();
      }
    });
    
    // Act - Navigate to My Trips page
    await page.goto('/my-trips');
    await page.waitForLoadState('networkidle');
    
    // Click delete button
    const deleteButton = page.locator(`[data-testid="delete-trip"][data-trip-id="${testData.deleteFlow.tripId}"]`);
    await deleteButton.click();
    
    // Wait for response
    await page.waitForResponse(
      response => response.url().includes(`/api/my-trips/${testData.deleteFlow.tripId}`) && response.request().method() === 'DELETE',
      { timeout: testData.timeouts.apiCall }
    );
    
    // Assert - API returned error (no UI assertion needed)
    
    // Assert - Trip should still be in the list
    const trip = page.locator(`[data-trip-id="${testData.deleteFlow.tripId}"]`);
    await expect(trip).toBeVisible();
  });

  test('should_handle_empty_trips_list', async ({ page }) => {
    // Arrange - Mock empty trips response
    await page.route('**/api/my-trips', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    // Act - Navigate to My Trips page
    await page.goto('/my-trips');
    
    // Assert - Check empty state is displayed
    const myTripsList = page.locator('[data-testid="mytrips-list"]');
    await expect(myTripsList).toBeVisible();
    
    // Assert - No delete buttons should exist
    const deleteButtons = page.locator('[data-testid="delete-trip"]');
    await expect(deleteButtons).toHaveCount(0);
  });
});