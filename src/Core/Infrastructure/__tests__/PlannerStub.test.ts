import { describe, it, expect } from 'vitest';
import { createPlannerService } from '../Services/PlannerStub';
import { ItinerarySchema } from '@/Shared/Contracts';

describe('PlannerStub', () => {
  const planner = createPlannerService();

  it('should_generate_schema_valid_itinerary', async () => {
    // Act
    const result = await planner.generateItinerary('Tokyo trip');

    // Assert - Validate against schema
    expect(() => ItinerarySchema.parse(result)).not.toThrow();
    expect(result.id).toBe('itinerary_rfxmpt');
    expect(result.sourceQuery).toBe('Tokyo trip');
    expect(result.title).toBe('Trip: Tokyo trip');
    expect(result.days).toHaveLength(3); // Deterministic based on hash
  });

  it('should_return_deterministic_results', async () => {
    // Act
    const result1 = await planner.generateItinerary('test query');
    const result2 = await planner.generateItinerary('test query');

    // Assert
    expect(result1).toEqual(result2);
  });

  it('should_return_defensive_copy', async () => {
    // Act
    const result1 = await planner.generateItinerary('defensive test');
    const result2 = await planner.generateItinerary('defensive test');

    // Assert - Different references
    expect(result1).not.toBe(result2);
    expect(result1.days).not.toBe(result2.days);
  });

  it('should_handle_empty_query_with_fallback', async () => {
    // Act
    const result = await planner.generateItinerary('');

    // Assert
    expect(result.id).toBe('itinerary_0');
    expect(result.sourceQuery).toBe('');
    expect(result.days).toHaveLength(1); // Fallback has 1 day
  });

  it('should_generate_different_itineraries_for_different_queries', async () => {
    // Act
    const result1 = await planner.generateItinerary('Paris vacation');
    const result2 = await planner.generateItinerary('London trip');

    // Assert
    expect(result1.id).not.toBe(result2.id);
    expect(result1.title).not.toBe(result2.title);
  });
});