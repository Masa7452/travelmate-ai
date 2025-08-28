/**
 * @fileoverview Segment validation and type guards for travel itinerary segments
 * 
 * Segments represent atomic activities within a travel day:
 * - POI (Point of Interest): Places to visit
 * - Move: Transportation between locations
 * - Meal: Dining activities
 * - Buffer: Flexible time blocks
 * 
 * All segments are validated using Zod schemas from Contracts and are immutable.
 */

import { SegmentSchema, type Segment } from '@/Shared/Contracts';

/**
 * Discriminated union type for segment kinds
 */
export type SegmentKind = 'poi' | 'move' | 'meal' | 'buffer';

/**
 * Validates a segment against the Zod schema
 * @param data - Raw segment data to validate
 * @returns Validated segment object
 * @throws ZodError if validation fails
 */
export const validateSegment = (data: unknown): Segment => {
  return SegmentSchema.parse(data);
};

/**
 * Type guard for POI segments
 */
export const isPoiSegment = (segment: Segment): segment is Extract<Segment, { type: 'poi' }> => {
  return segment.type === 'poi';
};

/**
 * Type guard for Move segments
 */
export const isMoveSegment = (segment: Segment): segment is Extract<Segment, { type: 'move' }> => {
  return segment.type === 'move';
};

/**
 * Type guard for Meal segments
 */
export const isMealSegment = (segment: Segment): segment is Extract<Segment, { type: 'meal' }> => {
  return segment.type === 'meal';
};

/**
 * Type guard for Buffer segments
 */
export const isBufferSegment = (segment: Segment): segment is Extract<Segment, { type: 'buffer' }> => {
  return segment.type === 'buffer';
};