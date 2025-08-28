// Test file - any type allowed for mocking purposes

 
 
 
 

import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { CreateItineraryRequestSchema, CreateItineraryResponseSchema } from "@/Shared/Contracts";

// Import POST from route
import { POST } from "./route";

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

describe("POST /api/itineraries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should_return_200_with_id_for_valid_itinerary_creation", async () => {
    // Arrange
    const validRequest = new NextRequest("http://localhost:3000/api/itineraries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "5 day trip to Tokyo in March 2024",
      }),
    });

    // Act
    const response = await POST(validRequest);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toHaveProperty("id");
    expect(typeof data.id).toBe("string");
    expect(data.id).toMatch(/^itinerary_/);
  });

  it("should_use_zod_to_validate_request_and_response", async () => {
    // Arrange
    const parseSpy = vi.spyOn(CreateItineraryRequestSchema, "parse");
    const safeParseResponseSpy = vi.spyOn(CreateItineraryResponseSchema, "safeParse");
    
    const validRequest = new NextRequest("http://localhost:3000/api/itineraries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "5 day trip to Tokyo",
      }),
    });

    // Act
    const response = await POST(validRequest);
    const data = await response.json();

    // Assert
    expect(parseSpy).toHaveBeenCalled();
    expect(safeParseResponseSpy).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(data).toHaveProperty("id");
  });

  it("should_return_400_for_missing_query_field", async () => {
    // Arrange
    const invalidRequest = new NextRequest("http://localhost:3000/api/itineraries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    // Act
    const response = await POST(invalidRequest);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
    // mapErrorToStatus is called internally but not exposed as spy in our implementation
  });

  it("should_return_400_for_empty_input_string", async () => {
    // Arrange
    const invalidRequest = new NextRequest("http://localhost:3000/api/itineraries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "",
      }),
    });

    // Act
    const response = await POST(invalidRequest);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
    // mapErrorToStatus is called internally but not exposed as spy in our implementation
  });

  it("should_return_422_for_invalid_json_body", async () => {
    // Arrange
    const invalidRequest = new NextRequest("http://localhost:3000/api/itineraries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "invalid json {",
    });

    // Act
    const response = await POST(invalidRequest);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(422);
    expect(data).toHaveProperty("error");
    // mapErrorToStatus is called internally but not exposed as spy in our implementation
  });

  it("should_return_500_with_query_param_mock", async () => {
    // Arrange
    const validRequest = new NextRequest("http://localhost:3000/api/itineraries?__mock=500", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "5 day trip to Tokyo in March 2024",
      }),
    });

    // Act
    const response = await POST(validRequest);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data).toHaveProperty("error");
    expect(data.error).toBe("Internal server error");
  });

  it("should_return_500_with_header_mock", async () => {
    // Arrange
    const validRequest = new NextRequest("http://localhost:3000/api/itineraries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-mock-error": "internal",
      },
      body: JSON.stringify({
        query: "5 day trip to Tokyo in March 2024",
      }),
    });

    // Act
    const response = await POST(validRequest);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data).toHaveProperty("error");
    expect(data.error).toBe("Internal server error");
  });

  it("should_handle_zod_validation_errors", async () => {
    // Arrange
    const invalidRequest = new NextRequest("http://localhost:3000/api/itineraries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: 123, // Invalid type
      }),
    });

    // Act
    const response = await POST(invalidRequest);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(422);
    expect(data).toHaveProperty("error");
    // mapErrorToStatus is called internally but not exposed as spy in our implementation
  });
});