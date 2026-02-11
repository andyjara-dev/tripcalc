/**
 * Itinerary Types
 * Type definitions for itinerary/timeline features (Phase 1-3)
 */

import type { CustomItemLocal } from '@/lib/validations/custom-item';
import type { DayPlan } from '@/types/trip-planner';

// Geolocation data
export interface GeoLocation {
  lat: number;
  lon: number;
  address: string;
  placeId?: string; // For caching
}

// Time slot for activities
export interface TimeSlot {
  startTime?: string; // "09:30" 24h format
  endTime?: string;   // "11:00" 24h format
  duration?: number;  // Minutes (auto-calculated or manual)
}

// Extended custom item with itinerary fields
export interface ItineraryItem extends CustomItemLocal {
  // Itinerary-specific fields (optional)
  timeSlot?: TimeSlot;
  location?: GeoLocation;
  bookingRequired?: boolean;
  bookingUrl?: string;
  isAISuggestion?: boolean; // Phase 3: from AI suggestions

  // Auto-fill fields (for saved locations feature)
  isAutoFilled?: boolean;      // Marks items auto-generated from saved locations
  autoFillSource?: string;     // SavedLocation.id that generated this item
}

// Route segment between two activities (Phase 2)
export interface RouteSegment {
  from: string; // item.id
  to: string;   // item.id
  distance: number; // meters
  duration: number; // minutes
  mode: 'walking' | 'transit' | 'cycling';
  geometry?: string; // Encoded polyline (optional, for map rendering)
}

// Route cache for a day
export interface RouteCache {
  calculatedAt: string; // ISO timestamp
  totalDistance: number; // meters
  totalDuration: number; // minutes
  segments: RouteSegment[];
}

// Extended day plan with itinerary features
export interface DayItinerary extends DayPlan {
  customItems: ItineraryItem[]; // Override with ItineraryItem type
  routeCache?: RouteCache; // Phase 2: cached route calculations
}

// Trip plan with itinerary
export interface TripPlanWithItinerary {
  cityId: string;
  tripStyle: 'budget' | 'midRange' | 'luxury';
  days: DayItinerary[];

  // Optional: saved locations for this trip (from saved-location feature)
  savedLocations?: any[]; // Type will be SavedLocation[] but avoid circular dependency
}

// AI Suggestion (Phase 3)
export interface AISuggestion {
  id: string;
  name: string;
  category: 'FOOD' | 'ACTIVITIES' | 'TRANSPORT' | 'SHOPPING' | 'OTHER';
  estimatedCost: number; // In cents
  duration: number; // Minutes
  location?: GeoLocation;
  reasoning: string; // Why this is suggested
  suggestedTime?: string; // "14:00" suggested start time
}

// Helper to check if a day has itinerary data
export function hasItineraryData(day: DayPlan): boolean {
  const items = day.customItems as ItineraryItem[];
  return items.some(item =>
    item.timeSlot !== undefined ||
    item.location !== undefined
  );
}

// Helper to sort items by time
export function sortItemsByTime(items: ItineraryItem[]): ItineraryItem[] {
  return [...items].sort((a, b) => {
    // Items without time go to the end
    if (!a.timeSlot?.startTime && !b.timeSlot?.startTime) return 0;
    if (!a.timeSlot?.startTime) return 1;
    if (!b.timeSlot?.startTime) return -1;

    // Compare times (HH:MM format)
    return a.timeSlot.startTime.localeCompare(b.timeSlot.startTime);
  });
}

// Helper to calculate duration between two time slots
export function calculateDurationBetween(
  endTime: string, // "11:00"
  startTime: string // "14:00"
): number {
  const [endH, endM] = endTime.split(':').map(Number);
  const [startH, startM] = startTime.split(':').map(Number);

  const endMinutes = endH * 60 + endM;
  const startMinutes = startH * 60 + startM;

  return startMinutes - endMinutes;
}

// Helper to format duration
export function formatDuration(minutes: number, locale: 'en' | 'es' = 'en'): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (locale === 'es') {
    if (hours > 0 && mins > 0) return `${hours}h ${mins}min`;
    if (hours > 0) return `${hours}h`;
    return `${mins}min`;
  }

  // English
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}

// Helper to format distance
export function formatDistance(meters: number, locale: 'en' | 'es' = 'en'): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}
