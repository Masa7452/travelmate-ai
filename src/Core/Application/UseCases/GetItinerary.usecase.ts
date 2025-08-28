/**
 * @fileoverview Get itinerary by ID use case
 * 
 * Retrieves an itinerary from the repository by its ID.
 * Throws NotFoundError if the itinerary doesn't exist.
 */

import { NotFoundError } from '@/Shared/Errors';

import type { Itinerary } from '@/Shared/Contracts';
import type { Repositories } from '@core/Infrastructure/Provider/repository';

/**
 * Retrieves an itinerary by its ID
 * @param repos - Repository dependencies
 * @param id - Itinerary ID to retrieve
 * @returns Promise resolving to the itinerary
 * @throws {NotFoundError} When itinerary with given ID doesn't exist
 */
export const GetItinerary = async (
  repos: Repositories,
  id: string
): Promise<Itinerary> => {
  const itinerary = await repos.itineraries.findById(id);
  
  if (itinerary === undefined || itinerary === null) {
    throw new NotFoundError(`Itinerary ${id} not found`);
  }
  
  return itinerary;
};

// Maintain backward compatibility with lowercase export
export const getItinerary = GetItinerary;