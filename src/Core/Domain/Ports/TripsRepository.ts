import type { MyTripCard } from '@shared/Contracts';

export type TripsRepository = {
  list(): Promise<MyTripCard[]>;
  add(trip: MyTripCard): Promise<void>;
  remove(id: string): Promise<boolean>;
}