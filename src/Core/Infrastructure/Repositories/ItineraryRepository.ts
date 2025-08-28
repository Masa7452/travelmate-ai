import type { Itinerary, PublicPlanCard } from '@/Shared/Contracts';

export type IItineraryRepository = {
  save(itinerary: Itinerary): Promise<void>;
  findById(id: string): Promise<Itinerary | null>;
  findPublic(): Promise<PublicPlanCard[]>;
};

export class InMemoryItineraryRepository implements IItineraryRepository {
  private readonly store = new Map<string, Itinerary>();

  async save(itinerary: Itinerary): Promise<void> {
    // Satisfy require-await without changing behavior
    await Promise.resolve();
    // Deep copy to prevent mutation
    this.store.set(itinerary.id, structuredClone(itinerary));
  }

  async findById(id: string): Promise<Itinerary | null> {
    // Satisfy require-await without changing behavior
    await Promise.resolve();
    const item = this.store.get(id);
    // Deep copy on retrieval
    return item ? structuredClone(item) : null;
  }

  async findPublic(): Promise<PublicPlanCard[]> {
    // Satisfy require-await without changing behavior
    await Promise.resolve();
    // Convert itineraries to public cards
    const cards: PublicPlanCard[] = [];
    for (const itinerary of this.store.values()) {
      cards.push({
        id: itinerary.id,
        title: itinerary.title,
        duration: `${itinerary.days.length} days`,
        highlights: itinerary.days.slice(0, 2).map(d => 
          `Day ${d.date}: ${d.segments.length} activities`
        ),
      });
    }
    return structuredClone(cards);
  }
}