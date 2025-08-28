/**
 * @fileoverview Delete trip use case
 * 
 * Removes a trip from the user's saved trips collection.
 */

import type { Repositories } from '@core/Infrastructure/Provider/repository';

/**
 * Deletes a trip by ID
 * @param repos - Repository dependencies
 * @param id - Trip ID to delete
 * @returns Promise resolving to true if deleted, false if not found
 */
export const DeleteTrip = async (
  repos: Repositories,
  id: string
): Promise<boolean> => {
  return repos.trips.delete(id);
};

// Maintain backward compatibility with lowercase export
export const deleteTrip = DeleteTrip;