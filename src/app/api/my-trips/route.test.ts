// Test file - any type allowed for mocking purposes

 
 
 
 
 

import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { MyTripCardSchema, SaveTripRequestSchema, MyTripCard, MyTripCardArraySchema } from "@/Shared/Contracts";
import * as errorMapping from "@/Shared/ErrorMapping";

import { GET, POST } from "./route";

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

describe("GET /api/my-trips", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should_return_200_with_my_trip_cards_array", async () => {
    // Arrange
    const request = new NextRequest("http://localhost:3000/api/my-trips");

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    
    // If array is not empty, validate structure
    if (data.length > 0) {
      data.forEach((card: any) => {
        expect(card).toHaveProperty("id");
        expect(card).toHaveProperty("title");
        expect(card).toHaveProperty("createdAt");
        expect(typeof card.id).toBe("string");
        expect(typeof card.title).toBe("string");
        expect(typeof card.createdAt).toBe("string");
        expect(card.id).toMatch(/^itinerary_[a-z0-9]+$/);
        // ISO timestamp check
        expect(new Date(card.createdAt).toISOString()).toBe(card.createdAt);
      });
    }
  });

  it("should_validate_response_with_zod_schema", async () => {
    // Arrange
    const safeParseResponseSpy = vi.spyOn(MyTripCardArraySchema, "safeParse");
    
    const request = new NextRequest("http://localhost:3000/api/my-trips", {
      method: "GET",
    });

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(safeParseResponseSpy).toHaveBeenCalledWith(data);
  });

  it("should_return_empty_array_when_user_has_no_trips", async () => {
    // Arrange
    const request = new NextRequest("http://localhost:3000/api/my-trips", {
      method: "GET",
    });

    // Mock empty response
    vi.mock("./route", async (importOriginal) => {
      const original = await importOriginal() as any;
      return {
        ...original,
        repository: {
          list: vi.fn().mockResolvedValue([]),
        },
      };
    });

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(0);
  });

  it("should_handle_internal_errors_properly", async () => {
    // Arrange - trigger mock 500 via query param
    const request = new NextRequest("http://localhost:3000/api/my-trips?__mock=500", {
      method: "GET",
    });

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data).toHaveProperty("error");
    expect(errorMapping.mapErrorToStatus).toHaveBeenCalled();
    expect(errorMapping.formatErrorResponse).toHaveBeenCalled();
  });
});

describe("POST /api/my-trips", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should_return_200_with_my_trip_card_on_success", async () => {
    // Arrange
    const request = new NextRequest("http://localhost:3000/api/my-trips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: "itinerary_123456",
        title: "My Tokyo Adventure"
      }),
    });

    // Expected response
    const expectedResponse: MyTripCard = {
      id: "itinerary_123456",
      title: "My Tokyo Adventure", 
      createdAt: new Date().toISOString()
    };

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toHaveProperty("id", expectedResponse.id);
    expect(data).toHaveProperty("title", expectedResponse.title);
    expect(data).toHaveProperty("createdAt");
    expect(typeof data.createdAt).toBe("string");
  });

  it("should_validate_request_with_zod_schema", async () => {
    // Arrange
    const parseSpy = vi.spyOn(SaveTripRequestSchema, "parse");
    const safeParseResponseSpy = vi.spyOn(MyTripCardSchema, "safeParse");
    
    const request = new NextRequest("http://localhost:3000/api/my-trips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: "itinerary_123456",
        title: "Valid Trip"
      }),
    });

    // Act
    const response = await POST(request);
    const _data = await response.json();

    // Assert
    expect(parseSpy).toHaveBeenCalled();
    expect(safeParseResponseSpy).toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it("should_return_400_when_id_is_missing", async () => {
    // Arrange
    const request = new NextRequest("http://localhost:3000/api/my-trips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "Missing ID Trip"
      }),
    });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
    expect(errorMapping.mapErrorToStatus).toHaveBeenCalled();
    expect(errorMapping.formatErrorResponse).toHaveBeenCalled();
  });

  it("should_return_400_when_title_is_missing", async () => {
    // Arrange
    const request = new NextRequest("http://localhost:3000/api/my-trips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: "itinerary_123456"
      }),
    });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
    expect(errorMapping.mapErrorToStatus).toHaveBeenCalled();
    expect(errorMapping.formatErrorResponse).toHaveBeenCalled();
  });

  it("should_return_422_when_id_has_invalid_format", async () => {
    // Arrange
    const request = new NextRequest("http://localhost:3000/api/my-trips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: "invalid-format-id",
        title: "Valid Title"
      }),
    });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(422);
    expect(data).toHaveProperty("error");
    expect(errorMapping.mapErrorToStatus).toHaveBeenCalled();
    expect(errorMapping.formatErrorResponse).toHaveBeenCalled();
  });

  it("should_return_422_when_title_is_empty", async () => {
    // Arrange
    const request = new NextRequest("http://localhost:3000/api/my-trips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: "itinerary_123456",
        title: ""
      }),
    });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(422);
    expect(data).toHaveProperty("error");
    expect(errorMapping.mapErrorToStatus).toHaveBeenCalled();
    expect(errorMapping.formatErrorResponse).toHaveBeenCalled();
  });

  it("should_handle_invalid_json_body", async () => {
    // Arrange
    const request = new NextRequest("http://localhost:3000/api/my-trips", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "invalid json {",
    });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(422);
    expect(data).toHaveProperty("error");
    expect(errorMapping.mapErrorToStatus).toHaveBeenCalled();
    expect(errorMapping.formatErrorResponse).toHaveBeenCalled();
  });

  it("should_handle_internal_errors_properly", async () => {
    // Arrange - trigger mock 500 via query param
    const request = new NextRequest("http://localhost:3000/api/my-trips?__mock=500", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: "itinerary_123456",
        title: "Valid Trip"
      }),
    });

    // Act
    const response = await POST(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data).toHaveProperty("error");
    expect(errorMapping.mapErrorToStatus).toHaveBeenCalled();
    expect(errorMapping.formatErrorResponse).toHaveBeenCalled();
  });
});