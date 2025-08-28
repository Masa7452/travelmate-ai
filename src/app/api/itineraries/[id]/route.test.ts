// Test file - any type allowed for mocking purposes

 
 
 

import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { ItinerarySchema } from "@/Shared/Contracts";
import * as errorMapping from "@/Shared/ErrorMapping";

// Import GET from route
import { GET } from "./route";
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

describe("GET /api/itineraries/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should_return_200_with_itinerary_data_for_existing_id", async () => {
    // Arrange - First create an itinerary via POST
    const postRequest = new NextRequest("http://localhost:3000/api/itineraries", {
      method: "POST",
      body: JSON.stringify({ query: "3 days in Tokyo" }),
    });
    const postResponse = await POST(postRequest);
    const postData = await postResponse.json();
    const existingId = postData.id;
    
    const request = new NextRequest(`http://localhost:3000/api/itineraries/${existingId}`, {
      method: "GET",
    });

    // Act
    const response = await GET(request, { params: Promise.resolve({ id: existingId }) });
    const data = await response.json();

    // Assert - Based on documented API contract
    expect(response.status).toBe(200);
    expect(data).toHaveProperty("id", existingId);
    expect(data).toHaveProperty("title");
    expect(data).toHaveProperty("sourceQuery");
    expect(data).toHaveProperty("days");
    expect(data).toHaveProperty("createdAt");
  });

  it("should_return_404_for_non_existent_id", async () => {
    // Arrange
    const nonExistentId = "itinerary_999999";
    const request = new NextRequest(`http://localhost:3000/api/itineraries/${nonExistentId}`, {
      method: "GET",
    });

    // Act
    const response = await GET(request, { params: Promise.resolve({ id: nonExistentId }) });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(404);
    expect(data).toHaveProperty("error");
    expect(errorMapping.mapErrorToStatus).toHaveBeenCalled();
    expect(errorMapping.formatErrorResponse).toHaveBeenCalled();
  });

  it("should_return_404_for_invalid_id_format", async () => {
    // Arrange
    const invalidId = "invalid-format";
    const request = new NextRequest(`http://localhost:3000/api/itineraries/${invalidId}`, {
      method: "GET",
    });

    // Act
    const response = await GET(request, { params: Promise.resolve({ id: invalidId }) });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(404);
    expect(data).toHaveProperty("error");
    expect(errorMapping.mapErrorToStatus).toHaveBeenCalled();
    expect(errorMapping.formatErrorResponse).toHaveBeenCalled();
  });

  it("should_return_valid_itinerary_structure_with_proper_data_types", async () => {
    // Arrange - First create an itinerary via POST
    const postRequest = new NextRequest("http://localhost:3000/api/itineraries", {
      method: "POST",
      body: JSON.stringify({ query: "3 days in Tokyo" }),
    });
    const postResponse = await POST(postRequest);
    const postData = await postResponse.json();
    const existingId = postData.id;
    
    const request = new NextRequest(`http://localhost:3000/api/itineraries/${existingId}`, {
      method: "GET",
    });

    // Act
    const response = await GET(request, { params: Promise.resolve({ id: existingId }) });
    const data = await response.json();

    // Assert - Based on documented API contract
    expect(response.status).toBe(200);
    expect(typeof data.id).toBe("string");
    expect(typeof data.title).toBe("string");
    expect(typeof data.sourceQuery).toBe("string");
    expect(typeof data.createdAt).toBe("string"); // ISO date string
    expect(Array.isArray(data.days)).toBe(true);
    expect(data.days.length).toBeGreaterThan(0);
    
    // Validate day structure
    const firstDay = data.days[0];
    expect(typeof firstDay.date).toBe("string");
    expect(Array.isArray(firstDay.segments)).toBe(true);
  });

  it("should_validate_response_with_zod_schema", async () => {
    // Arrange
    const safeParseResponseSpy = vi.spyOn(ItinerarySchema, "safeParse");
    
    // First create an itinerary via POST
    const postRequest = new NextRequest("http://localhost:3000/api/itineraries", {
      method: "POST",
      body: JSON.stringify({ query: "3 days in Tokyo" }),
    });
    const postResponse = await POST(postRequest);
    const postData = await postResponse.json();
    const existingId = postData.id;
    
    const request = new NextRequest(`http://localhost:3000/api/itineraries/${existingId}`, {
      method: "GET",
    });

    // Act
    const response = await GET(request, { params: Promise.resolve({ id: existingId }) });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(safeParseResponseSpy).toHaveBeenCalledWith(data);
  });

  it("should_handle_internal_errors_properly", async () => {
    // Arrange
    const existingId = "itinerary_error";
    const request = new NextRequest(`http://localhost:3000/api/itineraries/${existingId}`, {
      method: "GET",
    });

    // Mock repository error
    vi.mock("./route", async (importOriginal) => {
      const original = await importOriginal() as any;
      return {
        ...original,
        repository: {
          findById: vi.fn().mockRejectedValue(new Error("Database connection failed")),
        },
      };
    });

    // Act
    const response = await GET(request, { params: Promise.resolve({ id: existingId }) });
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data).toHaveProperty("error");
    expect(errorMapping.mapErrorToStatus).toHaveBeenCalled();
    expect(errorMapping.formatErrorResponse).toHaveBeenCalled();
  });
});