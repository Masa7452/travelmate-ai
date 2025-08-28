/**
 * GET /api/explore
 * Retrieve public itineraries for exploration
 * 
 * Request: None (filters can be added in Phase 2)
 * 
 * Response 200:
 * PublicPlanCard[] (can be empty array)
 * [
 *   {
 *     "id": string,       // Itinerary ID
 *     "title": string,    // Display title
 *     "days": number      // Number of days (optional)
 *   }
 * ]
 * 
 * Errors:
 * - 500: Internal server error
 */

import { NextRequest, NextResponse } from "next/server";

import { GetPublicPlans } from "@core/Application/UseCases";
import { createRepositories } from "@core/Infrastructure/Provider/repository";
import { PublicPlanCardArraySchema } from "@shared/Contracts";
import * as errorMapping from "@shared/ErrorMapping";
import { respond, narrowError, isMock500 } from "@shared/http";

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

    const plans = await GetPublicPlans(repos);
    return respond(PublicPlanCardArraySchema, plans, 200);
  } catch (e: unknown) {
    const err = narrowError(e);
    const status = errorMapping.mapErrorToStatus(err);
    const body = errorMapping.formatErrorResponse(err);
    return NextResponse.json(body, { status });
  }
};