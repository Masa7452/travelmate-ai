/**
 * @fileoverview Create itinerary use case
 * 
 * Creates a new itinerary based on user query and saves it to the repository.
 * Uses dependency injection for repositories and planner for testability.
 */

import type { Itinerary } from '@/Shared/Contracts';
import type { Repositories } from '@core/Infrastructure/Provider/repository';

/**
 * Creates a new itinerary based on user query
 * @param repos - Repository dependencies
 * @param input - Input containing the query string
 * @param planner - Function to generate itinerary from query
 * @param idFactory - Function to generate deterministic IDs
 * @returns Promise resolving to object with itinerary ID
 */
export const CreateItinerary = async (
  repos: Repositories,
  input: { query: string },
  planner: (query: string) => Promise<Itinerary>,
  _idFactory: () => string
): Promise<{ id: string }> => {
  // Mark param as intentionally unused
  void _idFactory;
  
  // Generate itinerary using the injected planner
  const itinerary = await planner(input.query);
  
  // Save to repository
  await repos.itineraries.save(itinerary);
  
  return { id: itinerary.id };
};

// Maintain backward compatibility with lowercase export
export const createItinerary = CreateItinerary;