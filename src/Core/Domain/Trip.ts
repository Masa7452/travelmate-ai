/**
 * @fileoverview Trip entity representing a user's saved trip
 * 
 * Note: This entity uses MyTripCard schema for consistency with the API contract.
 * All properties are immutable after construction.
 */

import { MyTripCardSchema, type MyTripCard } from '@/Shared/Contracts';

export class Trip {
  readonly id: string;
  readonly title: string;
  readonly createdAt: string;
  readonly thumbnail?: string;

  private constructor(data: MyTripCard) {
    const frozen = Object.freeze(structuredClone(data));
    this.id = frozen.id;
    this.title = frozen.title;
    this.createdAt = frozen.createdAt;
    this.thumbnail = frozen.thumbnail;
  }

  static create(data: unknown): Trip {
    const validated = MyTripCardSchema.parse(data);
    return new Trip(validated);
  }

  toJSON(): MyTripCard {
    const result: MyTripCard = {
      id: this.id,
      title: this.title,
      createdAt: this.createdAt,
    };
    if (this.thumbnail !== undefined) {
      result.thumbnail = this.thumbnail;
    }
    return structuredClone(result);
  }
}