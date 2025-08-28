/**
 * @fileoverview Add trip use case
 * 
 * Adds a new trip to the user's saved trips collection.
 * Uses dependency injection for timestamp generation to ensure testability.
 */

import type { MyTripCard } from '@/Shared/Contracts';
import type { Repositories } from '@core/Infrastructure/Provider/repository';

/**
 * Adds a new trip
 * @param repos - Repository dependencies
 * @param input - Input containing trip ID and title
 * @param now - Optional function to generate current timestamp (for deterministic testing)
 * @returns Promise resolving to the created trip card
 */
export const AddTrip = async (
  repos: Repositories,
  input: { id: string; title: string },
  now: () => Date = () => new Date()
): Promise<MyTripCard> => {
  const trip: MyTripCard = {
    id: input.id,
    title: input.title,
    createdAt: now().toISOString(),
  };
  
  await repos.trips.save(trip);
  return trip;
};

// Maintain backward compatibility with lowercase export
export const addTrip = AddTrip;