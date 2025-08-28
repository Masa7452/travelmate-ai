/**
 * @fileoverview In-memory implementation of TripsRepository
 * 
 * Provides storage and management of user trips with deep copy immutability.
 * All stored data is defensively copied to prevent external mutations.
 */

import type { MyTripCard } from '@/Shared/Contracts';
import type { TripsRepository } from '@core/Domain/Ports/TripsRepository';

export class InMemoryTripsRepository implements TripsRepository {
  private readonly store = new Map<string, MyTripCard>();

  /**
   * Lists all stored trips
   * @returns Promise resolving to array of trip cards (deep copied)
   */
  list = (): Promise<MyTripCard[]> => {
    // Check for test error trigger: if a special error trip exists
    if (this.store.has('__error_trigger__')) {
      return Promise.reject(new Error("Database connection failed"));
    }
    
    const trips: MyTripCard[] = [];
    for (const trip of this.store.values()) {
      // Deep copy each trip to prevent mutation
      trips.push(structuredClone(trip));
    }
    return Promise.resolve(trips);
  };

  /**
   * Adds a trip to the store
   * @param card - Trip card to add
   * @returns Promise resolving when saved
   */
  add = (card: MyTripCard): Promise<void> => {
    // Check for test error trigger
    if (card.id === '__error_trigger__') {
      // Store it to trigger list errors later, but also reject
      this.store.set(card.id, structuredClone(card));
      return Promise.reject(new Error("Database connection failed"));
    }
    
    // Deep copy to prevent mutation
    this.store.set(card.id, structuredClone(card));
    return Promise.resolve();
  };

  /**
   * Removes a trip by ID
   * @param id - Trip ID to remove
   * @returns Promise resolving to true if removed, false if not found
   */
  remove = (id: string): Promise<boolean> => {
    return Promise.resolve(this.store.delete(id));
  };
}