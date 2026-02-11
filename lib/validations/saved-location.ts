/**
 * Saved Location Validation Schemas
 */

import { z } from 'zod';

/**
 * Location category schema
 */
export const locationCategorySchema = z.enum([
  'ACCOMMODATION',
  'RESTAURANT',
  'LANDMARK',
  'TRANSPORT_HUB',
  'OTHER',
]);

/**
 * GeoLocation schema (reused from itinerary)
 */
export const geoLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  address: z.string().min(1),
  placeId: z.string().optional(),
});

/**
 * Saved location schema
 */
export const savedLocationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  category: locationCategorySchema,
  location: geoLocationSchema,
  isPrimary: z.boolean(),
  icon: z.string().max(4).optional(),
  notes: z.string().max(500).optional(),
  createdAt: z.string(),
});

/**
 * Array of saved locations (max 50)
 */
export const savedLocationsArraySchema = z.array(savedLocationSchema).max(50);

/**
 * Type exports
 */
export type SavedLocationInput = z.infer<typeof savedLocationSchema>;
export type SavedLocationsArray = z.infer<typeof savedLocationsArraySchema>;
