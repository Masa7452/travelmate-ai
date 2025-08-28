import { describe, it, expect } from 'vitest';
import { Itinerary } from '../Itinerary';
import type { Itinerary as IItinerary } from '@/Shared/Contracts';

describe('Itinerary', () => {
  const validItineraryData: IItinerary = {
    id: 'itinerary_123',
    createdAt: '2024-01-01T00:00:00Z',
    title: 'Tokyo Trip',
    sourceQuery: '3 days in Tokyo',
    days: [
      {
        date: '2024-01-01',
        segments: [
          { type: 'poi', name: 'Sensoji Temple', stayMin: 60 },
          { type: 'move', from: 'Sensoji Temple', to: 'Tokyo Skytree' },
          { type: 'meal', name: 'Lunch at Asakusa', stayMin: 45 },
        ],
      },
      {
        date: '2024-01-02',
        segments: [
          { type: 'buffer', min: 30 },
          { type: 'poi', name: 'Meiji Shrine', note: 'Morning visit' },
        ],
      },
    ],
  };

  describe('create', () => {
    it('should_create_itinerary_with_valid_data', () => {
      const itinerary = Itinerary.create(validItineraryData);
      
      expect(itinerary.id).toBe('itinerary_123');
      expect(itinerary.createdAt).toBe('2024-01-01T00:00:00Z');
      expect(itinerary.title).toBe('Tokyo Trip');
      expect(itinerary.sourceQuery).toBe('3 days in Tokyo');
      expect(itinerary.days).toHaveLength(2);
    });

    it('should_throw_validation_error_for_invalid_data', () => {
      const invalidData = {
        id: 123, // should be string
        title: 'Test',
        // missing required fields
      };

      expect(() => Itinerary.create(invalidData)).toThrow();
    });

    it('should_throw_for_empty_days_array', () => {
      const dataWithEmptyDays = {
        ...validItineraryData,
        days: [],
      };

      expect(() => Itinerary.create(dataWithEmptyDays)).toThrow();
    });

    it('should_ensure_immutability_of_properties', () => {
      const itinerary = Itinerary.create(validItineraryData);
      
      // Properties should be readonly
      expect(() => {
        // @ts-expect-error - testing readonly
        itinerary.id = 'new_id';
      }).toThrow();

      expect(() => {
        // @ts-expect-error - testing readonly
        itinerary.days = [];
      }).toThrow();
    });

    it('should_perform_defensive_copy_of_days_array', () => {
      const data = { ...validItineraryData };
      const itinerary = Itinerary.create(data);
      
      // Modifying original data should not affect itinerary
      data.days.push({
        date: '2024-01-03',
        segments: [],
      });

      expect(itinerary.days).toHaveLength(2);
    });
  });

  describe('toJSON', () => {
    it('should_return_plain_object_representation', () => {
      const itinerary = Itinerary.create(validItineraryData);
      const json = itinerary.toJSON();

      expect(json).toEqual(validItineraryData);
      expect(json).not.toBe(validItineraryData); // different reference
    });

    it('should_return_defensive_copy', () => {
      const itinerary = Itinerary.create(validItineraryData);
      const json1 = itinerary.toJSON();
      const json2 = itinerary.toJSON();

      // Each call returns a new object
      expect(json1).toEqual(json2);
      expect(json1).not.toBe(json2);
      
      // Arrays should also be different references
      expect(json1.days).not.toBe(json2.days);
      
      // Deep references should also be different
      expect(json1.days[0]).not.toBe(json2.days[0]);
      expect(json1.days[0].segments).not.toBe(json2.days[0].segments);
    });
  });
});