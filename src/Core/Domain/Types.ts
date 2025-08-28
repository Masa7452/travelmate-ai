/**
 * @fileoverview Core value objects for the travel domain
 * 
 * This module provides immutable value objects used throughout the domain:
 * - Day: Represents a single day in an itinerary with segments
 * - PublicPlanCard: Public-facing summary of an itinerary
 * - MyTripCard: User's saved trip summary
 * 
 * All value objects:
 * - Are immutable with readonly properties
 * - Validate input using Zod schemas from Contracts
 * - Perform defensive copying to prevent external mutation
 */

import {
  DaySchema,
  PublicPlanCardSchema,
  MyTripCardSchema,
  type Day as IDay,
  type PublicPlanCard as IPublicPlanCard,
  type MyTripCard as IMyTripCard,
  type Segment,
} from '@/Shared/Contracts';

/**
 * Value object representing a single day in an itinerary
 * Invariants:
 * - Date must be in YYYY-MM-DD format
 * - Segments array can be empty
 */
export class Day {
  readonly date: string;
  readonly segments: ReadonlyArray<Segment>;

  private constructor(data: IDay) {
    const copied = structuredClone(data);
    this.date = copied.date;
    this.segments = copied.segments;
    Object.freeze(this);
    Object.freeze(this.segments);
  }

  static create(data: unknown): Day {
    const validated = DaySchema.parse(data);
    return new Day(validated);
  }

  toJSON(): IDay {
    return structuredClone({
      date: this.date,
      segments: this.segments as Segment[],
    });
  }
}

/**
 * Value object for public plan display cards
 * Invariants:
 * - id and title are required
 * - thumbnail, duration, and highlights are optional
 */
export class PublicPlanCard {
  readonly id: string;
  readonly title: string;
  readonly thumbnail?: string;
  readonly duration?: string;
  readonly highlights?: ReadonlyArray<string>;

  private constructor(data: IPublicPlanCard) {
    const copied = structuredClone(data);
    this.id = copied.id;
    this.title = copied.title;
    this.thumbnail = copied.thumbnail;
    this.duration = copied.duration;
    this.highlights = copied.highlights;
    
    Object.freeze(this);
    if (this.highlights) {
      Object.freeze(this.highlights);
    }
  }

  static create(data: unknown): PublicPlanCard {
    const validated = PublicPlanCardSchema.parse(data);
    return new PublicPlanCard(validated);
  }

  toJSON(): IPublicPlanCard {
    const result: IPublicPlanCard = {
      id: this.id,
      title: this.title,
    };
    
    if (this.thumbnail !== undefined) result.thumbnail = this.thumbnail;
    if (this.duration !== undefined) result.duration = this.duration;
    if (this.highlights !== undefined) result.highlights = [...this.highlights];
    
    return result;
  }
}

/**
 * Value object for user's saved trip cards
 * Invariants:
 * - id, title, and createdAt are required
 * - thumbnail is optional
 */
export class MyTripCard {
  readonly id: string;
  readonly title: string;
  readonly createdAt: string;
  readonly thumbnail?: string;

  private constructor(data: IMyTripCard) {
    const copied = structuredClone(data);
    this.id = copied.id;
    this.title = copied.title;
    this.createdAt = copied.createdAt;
    this.thumbnail = copied.thumbnail;
    Object.freeze(this);
  }

  static create(data: unknown): MyTripCard {
    const validated = MyTripCardSchema.parse(data);
    return new MyTripCard(validated);
  }

  toJSON(): IMyTripCard {
    const result: IMyTripCard = {
      id: this.id,
      title: this.title,
      createdAt: this.createdAt,
    };
    
    if (this.thumbnail !== undefined) result.thumbnail = this.thumbnail;
    
    return result;
  }
}

// Re-export types from Shared/Contracts
export type {
  Itinerary,
  Trip,
  CreateItineraryInput,
  CreateTripInput
} from '@/Shared/Contracts';