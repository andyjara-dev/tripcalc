/**
 * Saved Location Types
 * User-saved locations (accommodation, restaurants, etc.) for quick itinerary filling
 */

import type { GeoLocation } from './itinerary';

/**
 * Category of saved location
 */
export type LocationCategory =
  | 'ACCOMMODATION'    // Hotels, Airbnb
  | 'RESTAURANT'       // Favorite restaurants
  | 'LANDMARK'         // Meeting points, landmarks
  | 'TRANSPORT_HUB'    // Train/bus stations
  | 'OTHER';           // Custom locations

/**
 * Saved location for a trip
 */
export interface SavedLocation {
  id: string;                    // nanoid()
  name: string;                  // "Hotel Barceló", "Favorite Café"
  category: LocationCategory;    // Type of location
  location: GeoLocation;         // Geographic data
  isPrimary: boolean;            // Is this the primary accommodation?
  icon?: string;                 // Optional emoji (🏨, 🍽️, 📍)
  notes?: string;                // Optional notes
  createdAt: string;             // ISO timestamp
}

/**
 * Icon mapping for location categories
 */
export const LOCATION_CATEGORY_ICONS: Record<LocationCategory, string> = {
  ACCOMMODATION: '🏨',
  RESTAURANT: '🍽️',
  LANDMARK: '📍',
  TRANSPORT_HUB: '🚉',
  OTHER: '📌',
};

/**
 * Helper to get icon for a saved location
 */
export function getLocationIcon(location: SavedLocation): string {
  return location.icon || LOCATION_CATEGORY_ICONS[location.category];
}
