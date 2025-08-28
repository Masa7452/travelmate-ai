/**
 * @fileoverview In-memory implementation of ItineraryRepository
 * 
 * Provides storage and retrieval of itineraries with deep copy immutability.
 * All stored data is defensively copied to prevent external mutations.
 */

import type { Itinerary } from '@/Shared/Contracts';
import type { ItineraryRepository } from '@core/Domain/Ports/ItineraryRepository';

export class InMemoryItineraryRepository implements ItineraryRepository {
  private readonly store = new Map<string, Itinerary>();

  /**
   * Saves an itinerary to the store with deep copy
   * @param itinerary - Itinerary to save
   * @returns Promise resolving when saved
   */
  save = (itinerary: Itinerary): Promise<void> => {
    // Deep copy to prevent mutation
    this.store.set(itinerary.id, structuredClone(itinerary));
    return Promise.resolve();
  };

  /**
   * Finds an itinerary by ID
   * @param id - Itinerary ID to search for
   * @returns Promise resolving to itinerary or undefined if not found
   */
  findById = (id: string): Promise<Itinerary | undefined> => {
    const item = this.store.get(id);
    // Deep copy on retrieval to prevent mutation
    return Promise.resolve(item ? structuredClone(item) : undefined);
  };
}