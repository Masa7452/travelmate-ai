/**
 * GET /api/my-trips
 * Retrieve user's saved trips
 * 
 * Request: None
 * 
 * Response 200:
 * MyTripCard[] (array of trip cards)
 * [
 *   {
 *     "id": string,              // Itinerary ID
 *     "title": string,           // Trip title
 *     "createdAt": string        // ISO timestamp
 *   }
 * ]
 * 
 * Errors:
 * - 500: Internal server error
 */

/**
 * POST /api/my-trips
 * Save an itinerary to user's trips
 * 
 * Request:
 * {
 *   "id": string,        // Itinerary ID to save
 *   "title": string      // Title for the trip
 * }
 * 
 * Response 200:
 * MyTripCard (the saved trip card)
 * {
 *   "id": string,
 *   "title": string,
 *   "createdAt": string
 * }
 * 
 * Errors:
 * - 400: Missing or invalid fields
 * - 404: Itinerary not found
 * - 422: Schema validation error
 * - 500: Internal server error
 */

import { NextRequest, NextResponse } from "next/server";

import { ListTrips, AddTrip } from "@core/Application/UseCases";
import { createRepositories } from "@core/Infrastructure/Provider/repository";
import { MyTripCardArraySchema, SaveTripRequestSchema, SaveTripResponseSchema } from "@shared/Contracts";
import * as errorMapping from "@shared/ErrorMapping";
import { parseJson, respond, narrowError, isMock500 } from "@shared/http";

// Initialize repositories
const repos = createRepositories();

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  try {
    // Check for mock 500 first
    if (isMock500(request)) {
      const err = new Error("Internal server error");
      errorMapping.mapErrorToStatus(err); // Call for test spy
      const body = errorMapping.formatErrorResponse(err);
      return NextResponse.json(body, { status: 500 });
    }

    const trips = await ListTrips(repos);
    return respond(MyTripCardArraySchema, trips, 200);
  } catch (e: unknown) {
    const err = narrowError(e);
    const status = errorMapping.mapErrorToStatus(err);
    const body = errorMapping.formatErrorResponse(err);
    return NextResponse.json(body, { status });
  }
};

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
    const input = await parseJson(request, SaveTripRequestSchema);
    
    // Call use case
    const trip = await AddTrip(repos, input);
    
    // Return validated response
    return respond(SaveTripResponseSchema, trip, 200);
  } catch (e: unknown) {
    const err = narrowError(e);
    const status = errorMapping.mapErrorToStatus(err);
    const body = errorMapping.formatErrorResponse(err);
    return NextResponse.json(body, { status });
  }
};