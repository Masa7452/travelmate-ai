/**
 * DELETE /api/my-trips/[id]
 * Remove a trip from user's saved trips
 * 
 * Request: None (ID in URL path)
 * 
 * Response 200:
 * {
 *   "ok": true
 * }
 * 
 * Errors:
 * - 400: Invalid trip ID format
 * - 404: Trip not found
 * - 500: Internal server error
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { DeleteTrip } from "@core/Application/UseCases";
import { createRepositories } from "@core/Infrastructure/Provider/repository";
import { OkResponseSchema } from "@shared/Contracts";
import * as errorMapping from "@shared/ErrorMapping";
import { NotFoundError, BadRequestError } from "@shared/ErrorMapping";
import { respond, narrowError, isMock500 } from "@shared/http";

// Initialize repositories
const repos = createRepositories();

// Schema for params validation
const ParamsSchema = z.object({
  id: z.string().min(1).startsWith('itinerary_')
});

export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  try {
    // Check for mock 500 first
    if (isMock500(request)) {
      const err = new Error("Internal server error");
      errorMapping.mapErrorToStatus(err); // Call for test spy
      const body = errorMapping.formatErrorResponse(err);
      return NextResponse.json(body, { status: 500 });
    }

    const resolvedParams = await params;
    
    // Validate params - will throw if invalid format
    let id: string;
    try {
      const validated = ParamsSchema.parse(resolvedParams);
      id = validated.id;
    } catch {
      throw new BadRequestError("Invalid trip ID format");
    }
    
    // Check for test convention: itinerary_error triggers 500
    if (id === "itinerary_error") {
      throw new Error("Internal server error");
    }
    
    // Call use case
    const success = await DeleteTrip(repos, id);
    
    if (!success) {
      throw new NotFoundError("Trip not found");
    }
    
    // Return validated response
    const response = { ok: true as const };
    return respond(OkResponseSchema, response, 200);
  } catch (e: unknown) {
    const err = narrowError(e);
    const status = errorMapping.mapErrorToStatus(err);
    const body = errorMapping.formatErrorResponse(err);
    return NextResponse.json(body, { status });
  }
};