/**
 * @fileoverview Itinerary aggregate root for travel plans
 * 
 * The Itinerary is the main domain entity representing a complete travel plan.
 * 
 * Invariants:
 * - The days array must be non-empty
 * - Days must be ordered chronologically by date (YYYY-MM-DD format)
 * - All properties are immutable after construction
 * - Each day contains segments representing activities
 */

import { ItinerarySchema, type Itinerary as IItinerary, type Day } from '@/Shared/Contracts';

export class Itinerary {
  readonly id: string;
  readonly createdAt: string;
  readonly title: string;
  readonly sourceQuery: string;
  readonly days: ReadonlyArray<Day>;

  private constructor(data: IItinerary) {
    // Defensive copy at construction time
    const copied = structuredClone(data);
    
    // Validate business rules
    if (copied.days.length === 0) {
      throw new Error('Itinerary must have at least one day');
    }
    
    this.id = copied.id;
    this.createdAt = copied.createdAt;
    this.title = copied.title;
    this.sourceQuery = copied.sourceQuery;
    this.days = copied.days;
    
    // Freeze to ensure immutability
    Object.freeze(this);
    Object.freeze(this.days);
  }

  static create(data: unknown): Itinerary {
    const validated = ItinerarySchema.parse(data);
    return new Itinerary(validated);
  }

  toJSON(): IItinerary {
    return structuredClone({
      id: this.id,
      createdAt: this.createdAt,
      title: this.title,
      sourceQuery: this.sourceQuery,
      days: this.days as Day[],
    });
  }
}