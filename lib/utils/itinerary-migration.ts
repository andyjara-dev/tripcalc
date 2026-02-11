/**
 * Itinerary Migration Utilities
 * Lazy migration of trip data to support itinerary features
 * without requiring database schema changes
 */

import type { DayPlan } from '@/types/trip-planner';
import type { DayItinerary, ItineraryItem } from '@/lib/types/itinerary';

/**
 * Migrate a trip's calculator state to support itinerary features
 * This is a lazy migration - only adds empty fields if they don't exist
 * No data is lost, backward compatible
 */
export function migrateToItinerary(calculatorState: any): DayItinerary[] {
  if (!calculatorState || !Array.isArray(calculatorState)) {
    return [];
  }

  return calculatorState.map((day: DayPlan) => {
    // Cast customItems to ItineraryItem[]
    const items: ItineraryItem[] = (day.customItems || []).map((item: any) => ({
      // Existing fields
      id: item.id,
      name: item.name,
      category: item.category,
      amount: item.amount,
      visits: item.visits || 1,
      isOneTime: item.isOneTime || false, // Deprecated but required
      notes: item.notes || '',

      // Itinerary fields (add if missing, preserve if exist)
      timeSlot: item.timeSlot || undefined,
      location: item.location || undefined,
      bookingRequired: item.bookingRequired || false,
      bookingUrl: item.bookingUrl || '',
      isAISuggestion: item.isAISuggestion || false,
    }));

    // Return day with migrated items
    const migratedDay: DayItinerary = {
      ...day,
      customItems: items,
      routeCache: (day as any).routeCache || undefined, // Phase 2
    };

    return migratedDay;
  });
}

/**
 * Check if a day has any itinerary data
 */
export function hasItineraryData(day: DayPlan | DayItinerary): boolean {
  const items = day.customItems as ItineraryItem[];

  return items.some(
    (item) =>
      item.timeSlot !== undefined ||
      item.location !== undefined ||
      item.bookingRequired ||
      item.isAISuggestion
  );
}

/**
 * Clean up route cache that's older than a specified number of days
 * Prevents JSON bloat in calculatorState
 */
export function cleanupRouteCache(
  days: DayItinerary[],
  maxAgeDays: number = 7
): DayItinerary[] {
  const now = Date.now();
  const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;

  return days.map((day) => {
    if (!day.routeCache) {
      return day;
    }

    // Check if cache is expired
    const cacheAge = now - new Date(day.routeCache.calculatedAt).getTime();

    if (cacheAge > maxAgeMs) {
      // Remove expired cache
      const { routeCache, ...dayWithoutCache } = day;
      return dayWithoutCache;
    }

    return day;
  });
}

/**
 * Get statistics about itinerary usage in a trip
 * Useful for analytics
 */
export function getItineraryStats(days: DayItinerary[]) {
  let totalActivities = 0;
  let activitiesWithTime = 0;
  let activitiesWithLocation = 0;
  let activitiesWithBooking = 0;
  let aiSuggestions = 0;
  let daysWithItinerary = 0;

  days.forEach((day) => {
    const items = day.customItems as ItineraryItem[];
    totalActivities += items.length;

    let dayHasItinerary = false;

    items.forEach((item) => {
      if (item.timeSlot?.startTime) {
        activitiesWithTime++;
        dayHasItinerary = true;
      }

      if (item.location) {
        activitiesWithLocation++;
        dayHasItinerary = true;
      }

      if (item.bookingRequired) {
        activitiesWithBooking++;
      }

      if (item.isAISuggestion) {
        aiSuggestions++;
      }
    });

    if (dayHasItinerary) {
      daysWithItinerary++;
    }
  });

  return {
    totalActivities,
    activitiesWithTime,
    activitiesWithLocation,
    activitiesWithBooking,
    aiSuggestions,
    daysWithItinerary,
    averageActivitiesPerDay: days.length > 0 ? totalActivities / days.length : 0,
  };
}
