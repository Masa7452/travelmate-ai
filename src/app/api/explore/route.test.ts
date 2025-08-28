// Test file - any type allowed for mocking purposes

 
 
 
 
 

import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { PublicPlanCardArraySchema } from "@/Shared/Contracts";
import * as errorMapping from "@/Shared/ErrorMapping";

import { GET } from "./route";

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

describe("GET /api/explore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should_return_200_with_public_plan_cards_array", async () => {
    // Arrange
    const request = new NextRequest("http://localhost:3000/api/explore");

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    
    // If array is not empty, validate structure
    if (data.length > 0) {
      data.forEach((card: any) => {
        // Check exact shape - no extra keys
        const allowedKeys = ['id', 'title', 'thumbnail', 'duration', 'highlights'];
        const actualKeys = Object.keys(card);
        actualKeys.forEach(key => {
          expect(allowedKeys).toContain(key);
        });
        
        // Required fields
        expect(card).toHaveProperty("id");
        expect(card).toHaveProperty("title");
        expect(typeof card.id).toBe("string");
        expect(typeof card.title).toBe("string");
        
        // Optional fields
        if (card.thumbnail !== undefined) {
          expect(typeof card.thumbnail).toBe("string");
        }
        if (card.duration !== undefined) {
          expect(typeof card.duration).toBe("string");
        }
        if (card.highlights !== undefined) {
          expect(Array.isArray(card.highlights)).toBe(true);
        }
      });
    }
  });

  it("should_validate_response_with_zod_schema", async () => {
    // Arrange
    const safeParseResponseSpy = vi.spyOn(PublicPlanCardArraySchema, "safeParse");
    const request = new NextRequest("http://localhost:3000/api/explore");
    
    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(safeParseResponseSpy).toHaveBeenCalledWith(data);
  });

  it("should_return_empty_array_when_no_itineraries_available", async () => {
    // Arrange
    // Mock empty response
    vi.mock("./route", async (importOriginal) => {
      const original = await importOriginal() as any;
      return {
        ...original,
        repository: {
          findPublic: vi.fn().mockResolvedValue([]),
        },
      };
    });
    const request = new NextRequest("http://localhost:3000/api/explore");

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(0);
  });

  it("should_handle_internal_errors_properly", async () => {
    // Arrange
    const request = new NextRequest("http://localhost:3000/api/explore?__mock=500");
    // Mock repository error
    vi.mock("./route", async (importOriginal) => {
      const original = await importOriginal() as any;
      return {
        ...original,
        repository: {
          findPublic: vi.fn().mockRejectedValue(new Error("Database connection failed")),
        },
      };
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

  it("should_not_include_private_itinerary_data", async () => {
    // Arrange
    const request = new NextRequest("http://localhost:3000/api/explore");

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    if (data.length > 0) {
      data.forEach((card: any) => {
        // Should not include these private fields
        expect(card).not.toHaveProperty("sourceQuery");
        expect(card).not.toHaveProperty("createdAt");
        expect(card).not.toHaveProperty("userId");
        expect(card).not.toHaveProperty("segments");
        expect(card).not.toHaveProperty("days.segments");
      });
    }
  });
});