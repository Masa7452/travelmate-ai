/**
 * POST /api/itineraries
 * Create a new itinerary from user query
 * 
 * Request:
 * {
 *   "query": string  // User's free-text travel request (Note: internally mapped to sourceQuery)
 * }
 * 
 * Response 200:
 * {
 *   "id": string  // Generated itinerary ID (format: "itinerary_xxx")
 * }
 * 
 * Errors:
 * - 400: Missing or empty query
 * - 422: Schema validation error
 * - 429: Rate limit exceeded (future)
 * - 500: Internal server error (mockable via ?__mock=500 or x-mock-error header)
 */

import { NextRequest, NextResponse } from "next/server";

import { CreateItinerary } from "@core/Application/UseCases";
import { createRepositories } from "@core/Infrastructure/Provider/repository";
import { createPlannerService } from "@core/Infrastructure/Services/PlannerStub";
import { CreateItineraryRequestSchema, CreateItineraryResponseSchema } from "@shared/Contracts";
import * as errorMapping from "@shared/ErrorMapping";
import { parseJson, respond, narrowError, isMock500 } from "@shared/http";
import { generateId } from "@shared/idGenerator";

// Initialize dependencies
const repos = createRepositories();
const planner = createPlannerService();

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  try {
    // Check for mock 500 first
    if (isMock500(request)) {
      const err = new Error("Internal server error");
      errorMapping.mapErrorToStatus(err); // Call for test spy
      const body = errorMapping.formatErrorResponse(err);
      return NextResponse.json(body, { status: 500 });
    }

    // Parse and validate request body
    const input = await parseJson(request, CreateItineraryRequestSchema);
    
    // Call use case
    const result = await CreateItinerary(
      repos, 
      { query: input.query },
      (q: string) => planner.generateItinerary(q),
      generateId
    );
    
    // Return validated response
    return respond(CreateItineraryResponseSchema, result, 200);
  } catch (e: unknown) {
    const err = narrowError(e);
    const status = errorMapping.mapErrorToStatus(err);
    const body = errorMapping.formatErrorResponse(err);
    return NextResponse.json(body, { status });
  }
};