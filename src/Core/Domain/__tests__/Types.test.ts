import { describe, it, expect } from 'vitest';
import { Day, PublicPlanCard, MyTripCard } from '../Types';
import type { 
  Day as IDay, 
  PublicPlanCard as IPublicPlanCard,
  MyTripCard as IMyTripCard 
} from '@/Shared/Contracts';

describe('Types', () => {
  describe('Day', () => {
    const validDayData: IDay = {
      date: '2024-01-01',
      segments: [
        { type: 'poi', name: 'Museum' },
        { type: 'meal', name: 'Lunch' },
      ],
    };

    it('should_create_day_with_valid_data', () => {
      const day = Day.create(validDayData);

      expect(day.date).toBe('2024-01-01');
      expect(day.segments).toHaveLength(2);
      expect(day.segments[0].type).toBe('poi');
    });

    it('should_throw_for_invalid_date_format', () => {
      const invalidData = {
        date: 123, // wrong type - should be string
        segments: [],
      };

      expect(() => Day.create(invalidData)).toThrow();
    });

    it('should_ensure_immutability', () => {
      const day = Day.create(validDayData);

      expect(() => {
        // @ts-expect-error - testing readonly
        day.date = '2024-01-02';
      }).toThrow();

      expect(() => {
        // @ts-expect-error - testing readonly
        day.segments = [];
      }).toThrow();
    });

    it('should_perform_defensive_copy', () => {
      const data = { ...validDayData };
      const day = Day.create(data);

      // Modifying original should not affect day
      data.segments.push({ type: 'buffer', min: 30 });
      expect(day.segments).toHaveLength(2);
    });

    it('should_return_defensive_copy_in_toJSON', () => {
      const day = Day.create(validDayData);
      const json1 = day.toJSON();
      const json2 = day.toJSON();

      // Each call returns a new object
      expect(json1).toEqual(json2);
      expect(json1).not.toBe(json2);
      
      // Arrays should also be different references
      expect(json1.segments).not.toBe(json2.segments);
      
      // Deep references should also be different
      if (json1.segments.length > 0) {
        expect(json1.segments[0]).not.toBe(json2.segments[0]);
      }
    });
  });

  describe('PublicPlanCard', () => {
    const validCardData: IPublicPlanCard = {
      id: 'plan_123',
      title: 'Weekend in Paris',
      thumbnail: 'https://example.com/image.jpg',
      duration: '3 days',
      highlights: ['Eiffel Tower', 'Louvre'],
    };

    it('should_create_card_with_all_fields', () => {
      const card = PublicPlanCard.create(validCardData);

      expect(card.id).toBe('plan_123');
      expect(card.title).toBe('Weekend in Paris');
      expect(card.thumbnail).toBe('https://example.com/image.jpg');
      expect(card.duration).toBe('3 days');
      expect(card.highlights).toEqual(['Eiffel Tower', 'Louvre']);
    });

    it('should_create_card_with_required_fields_only', () => {
      const minimalData: IPublicPlanCard = {
        id: 'plan_456',
        title: 'City Break',
      };

      const card = PublicPlanCard.create(minimalData);
      
      expect(card.id).toBe('plan_456');
      expect(card.title).toBe('City Break');
      expect(card.thumbnail).toBeUndefined();
      expect(card.duration).toBeUndefined();
      expect(card.highlights).toBeUndefined();
    });

    it('should_throw_for_missing_required_fields', () => {
      const invalidData = {
        title: 'Test',
        // missing 'id'
      };

      expect(() => PublicPlanCard.create(invalidData)).toThrow();
    });

    it('should_ensure_immutability', () => {
      const card = PublicPlanCard.create(validCardData);

      expect(() => {
        // @ts-expect-error - testing readonly
        card.id = 'new_id';
      }).toThrow();

      expect(() => {
        // @ts-expect-error - testing readonly
        card.highlights = [];
      }).toThrow();
    });

    it('should_return_defensive_copy_in_toJSON', () => {
      const card = PublicPlanCard.create(validCardData);
      const json = card.toJSON();

      expect(json).toEqual(validCardData);
      
      if (json.highlights) {
        json.highlights.push('New Item');
        expect(card.highlights).toHaveLength(2);
      }
    });
  });

  describe('MyTripCard', () => {
    const validTripData: IMyTripCard = {
      id: 'trip_789',
      title: 'Summer Vacation',
      createdAt: '2024-01-01T12:00:00Z',
      thumbnail: 'https://example.com/trip.jpg',
    };

    it('should_create_trip_card_with_all_fields', () => {
      const card = MyTripCard.create(validTripData);

      expect(card.id).toBe('trip_789');
      expect(card.title).toBe('Summer Vacation');
      expect(card.createdAt).toBe('2024-01-01T12:00:00Z');
      expect(card.thumbnail).toBe('https://example.com/trip.jpg');
    });

    it('should_create_trip_card_without_thumbnail', () => {
      const dataWithoutThumbnail: IMyTripCard = {
        id: 'trip_000',
        title: 'Quick Trip',
        createdAt: '2024-02-01T00:00:00Z',
      };

      const card = MyTripCard.create(dataWithoutThumbnail);
      
      expect(card.thumbnail).toBeUndefined();
    });

    it('should_throw_for_invalid_data', () => {
      const invalidData = {
        id: 'trip_bad',
        // missing required fields
      };

      expect(() => MyTripCard.create(invalidData)).toThrow();
    });

    it('should_ensure_immutability', () => {
      const card = MyTripCard.create(validTripData);

      expect(() => {
        // @ts-expect-error - testing readonly
        card.title = 'New Title';
      }).toThrow();
    });

    it('should_return_defensive_copy_in_toJSON', () => {
      const card = MyTripCard.create(validTripData);
      const json1 = card.toJSON();
      const json2 = card.toJSON();

      expect(json1).toEqual(json2);
      expect(json1).not.toBe(json2);
    });
  });
});