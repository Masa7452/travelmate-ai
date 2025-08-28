/**
 * @fileoverview Get public plans use case
 * 
 * Retrieves all public plan cards from the repository.
 * These are curated itineraries available for all users to browse.
 */

import type { PublicPlanCard } from '@/Shared/Contracts';
import type { Repositories } from '@core/Infrastructure/Provider/repository';

/**
 * Retrieves all public plan cards
 * @param repos - Repository dependencies
 * @returns Promise resolving to array of public plan cards
 */
export const GetPublicPlans = async (
  repos: Repositories
): Promise<PublicPlanCard[]> => {
  return repos.itineraries.findPublic();
};

// Maintain backward compatibility with lowercase export
export const getPublicPlans = GetPublicPlans;