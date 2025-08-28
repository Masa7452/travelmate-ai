import type { Itinerary } from '@shared/Contracts';

export type ItineraryRepository = {
  save(itinerary: Itinerary): Promise<void>;
  findById(id: string): Promise<Itinerary | undefined>;
}