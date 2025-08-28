import { InMemoryItineraryRepository } from '@core/Infrastructure/Repositories/ItineraryRepository';
import { InMemoryTripRepository } from '@core/Infrastructure/Repositories/TripRepository';

import type { IItineraryRepository } from '@core/Infrastructure/Repositories/ItineraryRepository';
import type { ITripRepository } from '@core/Infrastructure/Repositories/TripRepository';

export type Repositories = {
  itineraries: IItineraryRepository;
  trips: ITripRepository;
}

// Singleton instances for in-memory repositories
const itineraryRepository = new InMemoryItineraryRepository();
const tripsRepository = new InMemoryTripRepository();

export const createRepositories = (): Repositories => ({
  itineraries: itineraryRepository,
  trips: tripsRepository,
});