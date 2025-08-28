import type { MyTripCard } from '@/Shared/Contracts';

export type ITripRepository = {
  save(trip: MyTripCard): Promise<void>;
  list(): Promise<MyTripCard[]>;
  delete(id: string): Promise<boolean>;
};

export class InMemoryTripRepository implements ITripRepository {
  private readonly store = new Map<string, MyTripCard>();

  async save(trip: MyTripCard): Promise<void> {
    // Satisfy require-await without changing behavior
    await Promise.resolve();
    // Deep copy to prevent mutation
    this.store.set(trip.id, structuredClone(trip));
  }

  async list(): Promise<MyTripCard[]> {
    // Satisfy require-await without changing behavior
    await Promise.resolve();
    const trips: MyTripCard[] = [];
    for (const trip of this.store.values()) {
      trips.push(structuredClone(trip));
    }
    return trips;
  }

  async delete(id: string): Promise<boolean> {
    // Satisfy require-await without changing behavior
    await Promise.resolve();
    return this.store.delete(id);
  }
}