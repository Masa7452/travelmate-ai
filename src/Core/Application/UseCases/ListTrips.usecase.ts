/**
 * @fileoverview List trips use case
 * 
 * Retrieves all saved trips for the current user from the repository.
 */

import type { MyTripCard } from '@/Shared/Contracts';
import type { Repositories } from '@core/Infrastructure/Provider/repository';

/**
 * Lists all saved trips
 * @param repos - Repository dependencies
 * @returns Promise resolving to array of trip cards
 */
export const ListTrips = async (
  repos: Repositories
): Promise<MyTripCard[]> => {
  return repos.trips.list();
};

// Maintain backward compatibility with lowercase export
export const listTrips = ListTrips;