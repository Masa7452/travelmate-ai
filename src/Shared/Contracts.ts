/**
 * @fileoverview Domain contracts and Zod schemas for Travelmate AI
 * 
 * This module defines the core data structures and validation schemas
 * for the travel planning application. All types are immutable and
 * validated using Zod schemas to ensure type safety at runtime boundaries.
 */

import { z } from 'zod';

// Segment types
export const SegmentSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('poi'),
    name: z.string(),
    stayMin: z.number().optional(),
    note: z.string().optional(),
  }),
  z.object({
    type: z.literal('move'),
    from: z.string(),
    to: z.string(),
    mode: z.enum(['walk', 'bus', 'train']).optional(),
    etaMin: z.number().optional(),
  }),
  z.object({
    type: z.literal('meal'),
    name: z.string(),
    stayMin: z.number().optional(),
  }),
  z.object({
    type: z.literal('buffer'),
    min: z.number(),
  }),
]);

// Day schema
export const DaySchema = z.object({
  date: z.string(), // YYYY-MM-DD
  segments: z.array(SegmentSchema),
});

// Itinerary schema - updated to match requirements
export const ItinerarySchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  title: z.string(),
  sourceQuery: z.string(),
  days: z.array(DaySchema),
});

// Public plan card
export const PublicPlanCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  thumbnail: z.string().optional(),
  duration: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

// My trip card
export const MyTripCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  createdAt: z.string(),
  thumbnail: z.string().optional(),
});

export const TripSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  destination: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});

export const CreateItineraryInputSchema = z.object({
  destination: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  budget: z.number().optional(),
});

export const CreateTripInputSchema = z.object({
  title: z.string(),
  destination: z.string(),
  start_date: z.string(),
  end_date: z.string(),
});

// API Request/Response schemas
export const CreateItineraryRequestSchema = z.object({
  query: z.string().min(1, "Input query cannot be empty"),
});

export const CreateItineraryResponseSchema = z.object({
  id: z.string(),
});

// For test compatibility
export const SaveTripRequestSchema = z.object({
  id: z.string().min(1).refine(
    (id) => id.startsWith('itinerary_'),
    { message: "Invalid ID format" }
  ),
  title: z.string().min(1),
});

export const SaveTripResponseSchema = MyTripCardSchema;

// Array schemas for API responses (used by test spies)
export const PublicPlanCardArraySchema = z.array(PublicPlanCardSchema);
export const MyTripCardArraySchema = z.array(MyTripCardSchema);
export const OkResponseSchema = z.object({ ok: z.literal(true) });

// Type exports
export type Segment = z.infer<typeof SegmentSchema>;
export type Day = z.infer<typeof DaySchema>;
export type Itinerary = z.infer<typeof ItinerarySchema>;
export type PublicPlanCard = z.infer<typeof PublicPlanCardSchema>;
export type MyTripCard = z.infer<typeof MyTripCardSchema>;
export type Trip = z.infer<typeof TripSchema>;
export type CreateItineraryInput = z.infer<typeof CreateItineraryInputSchema>;
export type CreateTripInput = z.infer<typeof CreateTripInputSchema>;
export type SaveTripRequest = z.infer<typeof SaveTripRequestSchema>;
export type SaveTripResponse = z.infer<typeof SaveTripResponseSchema>;