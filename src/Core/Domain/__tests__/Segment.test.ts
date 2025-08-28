import { describe, it, expect } from 'vitest';
import { validateSegment, isPoiSegment, isMoveSegment, isMealSegment, isBufferSegment } from '../Segment';
import type { Segment } from '@/Shared/Contracts';

describe('Segment', () => {
  describe('validateSegment', () => {
    it('should_validate_poi_segment', () => {
      const poiSegment: Segment = {
        type: 'poi',
        name: 'Tokyo Tower',
        stayMin: 90,
        note: 'Great views',
      };

      const result = validateSegment(poiSegment);
      expect(result).toEqual(poiSegment);
    });

    it('should_validate_move_segment', () => {
      const moveSegment: Segment = {
        type: 'move',
        from: 'Hotel',
        to: 'Station',
        mode: 'walk',
        etaMin: 15,
      };

      const result = validateSegment(moveSegment);
      expect(result).toEqual(moveSegment);
    });

    it('should_validate_meal_segment', () => {
      const mealSegment: Segment = {
        type: 'meal',
        name: 'Sushi Restaurant',
        stayMin: 60,
      };

      const result = validateSegment(mealSegment);
      expect(result).toEqual(mealSegment);
    });

    it('should_validate_buffer_segment', () => {
      const bufferSegment: Segment = {
        type: 'buffer',
        min: 30,
      };

      const result = validateSegment(bufferSegment);
      expect(result).toEqual(bufferSegment);
    });

    it('should_throw_for_invalid_segment_type', () => {
      const invalidSegment = {
        type: 'invalid',
        name: 'Test',
      };

      expect(() => validateSegment(invalidSegment as any)).toThrow();
    });

    it('should_throw_for_missing_required_fields', () => {
      const invalidPoi = {
        type: 'poi',
        // missing 'name'
      };

      expect(() => validateSegment(invalidPoi as any)).toThrow();
    });

    it('should_allow_optional_fields_to_be_undefined', () => {
      const minimalPoi: Segment = {
        type: 'poi',
        name: 'Place',
        // stayMin and note are optional
      };

      const result = validateSegment(minimalPoi);
      expect(result).toEqual(minimalPoi);
    });
  });

  describe('type guards', () => {
    it('should_identify_poi_segment', () => {
      const poi: Segment = { type: 'poi', name: 'Temple' };
      const move: Segment = { type: 'move', from: 'A', to: 'B' };

      expect(isPoiSegment(poi)).toBe(true);
      expect(isPoiSegment(move)).toBe(false);
    });

    it('should_identify_move_segment', () => {
      const move: Segment = { type: 'move', from: 'A', to: 'B' };
      const meal: Segment = { type: 'meal', name: 'Restaurant' };

      expect(isMoveSegment(move)).toBe(true);
      expect(isMoveSegment(meal)).toBe(false);
    });

    it('should_identify_meal_segment', () => {
      const meal: Segment = { type: 'meal', name: 'Cafe' };
      const buffer: Segment = { type: 'buffer', min: 20 };

      expect(isMealSegment(meal)).toBe(true);
      expect(isMealSegment(buffer)).toBe(false);
    });

    it('should_identify_buffer_segment', () => {
      const buffer: Segment = { type: 'buffer', min: 15 };
      const poi: Segment = { type: 'poi', name: 'Park' };

      expect(isBufferSegment(buffer)).toBe(true);
      expect(isBufferSegment(poi)).toBe(false);
    });
  });
});