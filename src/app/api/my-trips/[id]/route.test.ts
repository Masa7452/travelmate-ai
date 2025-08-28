// Test file - any type allowed for mocking purposes

 
 
 
 
 

import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { OkResponseSchema } from "@/Shared/Contracts";
import * as errorMapping from "@/Shared/ErrorMapping";

import { DELETE } from "./route";
import { POST } from "../route";

// Mock the errorMapping module to re-export error classes and mock functions
vi.mock("@/Shared/ErrorMapping", async () => {
  const actual = await vi.importActual<typeof import("@/Shared/ErrorMapping")>("@/Shared/ErrorMapping");
  return {
    ...actual,
    mapErrorToStatus: vi.fn((error: unknown) => {
      // Use the actual mapErrorToStatus logic
      return actual.mapErrorToStatus(error);
    }),
    formatErrorResponse: vi.fn((error: unknown) => {
      // Use the actual formatErrorResponse logic
      return actual.formatErrorResponse(error);
    })
  };
});

describe("DELETE /api/my-trips/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should_return_200_with_ok_true_when_successfully_deleting_a_trip", async () => {
    // Arrange - First create a trip
    const tripId = "itinerary_123456";
    const postRequest = new NextRequest("http://localhost:3000/api/my-trips", {
      method: "POST",
      body: JSON.stringify({ id: tripId, title: "Test Trip" }),
    });
    await POST(postRequest);
    
    const request = new NextRequest(`http://localhost:3000/api/my-trips/${tripId}`, {
      method: "DELETE",
    });

    // Act
    const response = await DELETE(request, { params: Promise.resolve({ id: tripId }) });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toEqual({ ok: true });
  });

  it("should_validate_response_with_zod_schema", async () => {
    // Arrange - First create a trip
    const safeParseResponseSpy = vi.spyOn(OkResponseSchema, "safeParse");
    const tripId = "itinerary_123456";
    const postRequest = new NextRequest("http://localhost:3000/api/my-trips", {
      method: "POST",
      body: JSON.stringify({ id: tripId, title: "Test Trip" }),
    });
    await POST(postRequest);
    
    const request = new NextRequest(`http://localhost:3000/api/my-trips/${tripId}`, {
      method: "DELETE",
    });

    // Act
    const response = await DELETE(request, { params: Promise.resolve({ id: tripId }) });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(safeParseResponseSpy).toHaveBeenCalledWith(data);
  });

  it("should_return_404_when_trip_not_found", async () => {
    // Arrange
    const nonExistentId = "itinerary_999999";
    const request = new NextRequest(`http://localhost:3000/api/my-trips/${nonExistentId}`, {
      method: "DELETE",
    });

    // Mock repository returning not found
    vi.mock("./route", async (importOriginal) => {
      const original = await importOriginal() as any;
      return {
        ...original,
        repository: {
          remove: vi.fn().mockResolvedValue(false),
        },
      };
    });

    // Act
    const response = await DELETE(request, { params: Promise.resolve({ id: nonExistentId }) });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(404);
    expect(data).toHaveProperty("error");
    expect(errorMapping.mapErrorToStatus).toHaveBeenCalled();
    expect(errorMapping.formatErrorResponse).toHaveBeenCalled();
  });

  it("should_return_400_for_invalid_trip_id_format", async () => {
    // Arrange
    const invalidId = "invalid-format";
    const request = new NextRequest(`http://localhost:3000/api/my-trips/${invalidId}`, {
      method: "DELETE",
    });

    // Act
    const response = await DELETE(request, { params: Promise.resolve({ id: invalidId }) });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
    expect(errorMapping.mapErrorToStatus).toHaveBeenCalled();
    expect(errorMapping.formatErrorResponse).toHaveBeenCalled();
  });

  it("should_handle_internal_errors_properly", async () => {
    // Arrange - trigger mock 500 via query param
    const tripId = "itinerary_123456";
    const request = new NextRequest(`http://localhost:3000/api/my-trips/${tripId}?__mock=500`, {
      method: "DELETE",
    });

    // Act
    const response = await DELETE(request, { params: Promise.resolve({ id: tripId }) });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data).toHaveProperty("error");
    expect(errorMapping.mapErrorToStatus).toHaveBeenCalled();
    expect(errorMapping.formatErrorResponse).toHaveBeenCalled();
  });

  it("should_handle_empty_id_parameter", async () => {
    // Arrange
    const request = new NextRequest("http://localhost:3000/api/my-trips/", {
      method: "DELETE",
    });

    // Act
    const response = await DELETE(request, { params: Promise.resolve({ id: "" }) });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
    expect(errorMapping.mapErrorToStatus).toHaveBeenCalled();
    expect(errorMapping.formatErrorResponse).toHaveBeenCalled();
  });

  it("should_use_error_mapping_for_404_response", async () => {
    // Arrange
    const tripId = "itinerary_notfound";
    const request = new NextRequest(`http://localhost:3000/api/my-trips/${tripId}`, {
      method: "DELETE",
    });

    // Act
    const response = await DELETE(request, { params: Promise.resolve({ id: tripId }) });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(404);
    expect(data).toHaveProperty("error");
    expect(errorMapping.mapErrorToStatus).toHaveBeenCalled();
  });

  it("should_use_error_mapping_for_400_response", async () => {
    // Arrange
    const invalidId = "invalid_id!";
    const request = new NextRequest(`http://localhost:3000/api/my-trips/${invalidId}`, {
      method: "DELETE",
    });

    // Act
    const response = await DELETE(request, { params: Promise.resolve({ id: invalidId }) });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
    expect(errorMapping.mapErrorToStatus).toHaveBeenCalled();
  });

  it("should_use_error_mapping_for_500_response", async () => {
    // Arrange
    const tripId = "itinerary_error";
    const request = new NextRequest(`http://localhost:3000/api/my-trips/${tripId}`, {
      method: "DELETE",
    });

    // Act
    const response = await DELETE(request, { params: Promise.resolve({ id: tripId }) });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data).toHaveProperty("error");
    expect(errorMapping.mapErrorToStatus).toHaveBeenCalled();
  });
});