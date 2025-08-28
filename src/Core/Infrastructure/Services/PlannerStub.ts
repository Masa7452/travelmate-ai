/**
 * @fileoverview Planner stub service for generating itineraries
 * 
 * Provides a deterministic planner that generates schema-valid itineraries
 * from user queries. Includes fallback template for error handling.
 */

import { ItinerarySchema, type Itinerary, type Day } from '@/Shared/Contracts';

export type PlannerService = {
  generateItinerary(query: string): Promise<Itinerary>;
}

// Deterministic planner stub with caching
const cache = new Map<string, Itinerary>();

/**
 * Creates a fallback template itinerary for error cases
 */
const createFallbackTemplate = (query: string, id: string): Itinerary => {
  const now = new Date('2024-01-01T00:00:00Z'); // Fixed date for determinism
  return {
    id,
    createdAt: now.toISOString(),
    title: `Trip: ${query.substring(0, 50)}`,
    sourceQuery: query,
    days: [{
      date: '2024-01-01',
      segments: [
        { type: 'poi', name: 'Default Location', stayMin: 120 },
        { type: 'meal', name: 'Default Restaurant', stayMin: 60 },
      ],
    }],
  };
};

/**
 * Generates a deterministic ID from query string
 */
const generateId = (query: string): string => {
  const hash = query.split('').reduce((a, b) => {
    const h = ((a << 5) - a) + b.charCodeAt(0);
    return h & h;
  }, 0);
  return `itinerary_${Math.abs(hash).toString(36)}`;
};

export const createPlannerService = (): PlannerService => ({
  generateItinerary: async (query: string) => {
    // Satisfy require-await without changing behavior
    await Promise.resolve();
    
    // Return cached result for determinism
    if (cache.has(query)) {
      return structuredClone(cache.get(query)!);
    }

    const id = generateId(query);
    
    try {
      // Generate deterministic response based on query hash
      const hashCode = query.split('').reduce((a, b) => {
        const h = ((a << 5) - a) + b.charCodeAt(0);
        return h & h;
      }, 0);

      const baseDate = new Date('2024-03-01');
      const dayCount = 1 + (Math.abs(hashCode) % 3); // 1-3 days
      
      const days: Day[] = [];
      for (let i = 0; i < dayCount; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() + i);
        days.push({
          date: date.toISOString().split('T')[0],
          segments: [
            { type: 'poi', name: `Location ${i + 1}`, stayMin: 120 },
            { type: 'meal', name: `Restaurant ${i + 1}`, stayMin: 60 },
          ],
        });
      }

      const itinerary: Itinerary = {
        id,
        createdAt: new Date('2024-01-01T00:00:00Z').toISOString(),
        title: `Trip: ${query.substring(0, 50)}`,
        sourceQuery: query,
        days,
      };

      // Validate against schema
      const validated = ItinerarySchema.parse(itinerary);
      
      cache.set(query, structuredClone(validated));
      return structuredClone(validated);
      
    } catch {
      // Fallback template on failure
      const fallback = createFallbackTemplate(query, id);
      cache.set(query, structuredClone(fallback));
      return structuredClone(fallback);
    }
  },
});