/**
 * Itinerary Auto-fill Utilities
 * Logic for automatically filling itinerary items with saved locations
 */

import type { DayItinerary, ItineraryItem, GeoLocation } from '@/lib/types/itinerary';
import type { SavedLocation } from '@/lib/types/saved-location';
import { nanoid } from 'nanoid';

/**
 * Haversine distance formula (in meters)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Check if two locations match (fuzzy matching)
 * Match if: same placeId OR coordinates within 50m
 */
export function locationsMatch(loc1?: GeoLocation, loc2?: GeoLocation): boolean {
  if (!loc1 || !loc2) return false;

  // Match by placeId (exact)
  if (loc1.placeId && loc2.placeId && loc1.placeId === loc2.placeId) {
    return true;
  }

  // Match by coordinates (within 50m)
  const distance = calculateDistance(loc1.lat, loc1.lon, loc2.lat, loc2.lon);
  return distance <= 50; // 50 meters tolerance
}

/**
 * Check if a day has accommodation at start or end
 */
export function hasAccommodationAt(
  items: ItineraryItem[],
  position: 'start' | 'end'
): boolean {
  if (items.length === 0) return false;

  const item = position === 'start' ? items[0] : items[items.length - 1];
  return item.category === 'ACCOMMODATION';
}

/**
 * Create an accommodation item from a saved location
 */
export function createAccommodationItem(
  name: string,
  savedLocation: SavedLocation,
  time: string
): ItineraryItem {
  return {
    id: nanoid(),
    name,
    category: 'ACCOMMODATION',
    amount: 0, // No cost for check-in/check-out
    visits: 1,
    isOneTime: false, // Required for backward compatibility
    notes: '',
    timeSlot: {
      startTime: time,
    },
    location: savedLocation.location,
    isAutoFilled: true,
    autoFillSource: savedLocation.id,
  };
}

/**
 * Auto-fills first and last activity of a day with primary accommodation
 */
export function autoFillDayAccommodation(
  day: DayItinerary,
  primaryLocation: SavedLocation
): DayItinerary {
  const items = [...day.customItems] as ItineraryItem[];

  // Add "Check-out" as first item if no accommodation at start
  if (!hasAccommodationAt(items, 'start')) {
    items.unshift(
      createAccommodationItem('Check-out', primaryLocation, '09:00')
    );
  }

  // Add "Check-in" as last item if no accommodation at end
  if (!hasAccommodationAt(items, 'end')) {
    items.push(
      createAccommodationItem('Check-in', primaryLocation, '18:00')
    );
  }

  return { ...day, customItems: items };
}

/**
 * Auto-fill all days with primary accommodation
 */
export function autoFillAllDays(
  days: DayItinerary[],
  primaryLocation: SavedLocation
): DayItinerary[] {
  return days.map((day) => autoFillDayAccommodation(day, primaryLocation));
}

/**
 * Remove auto-filled items for a specific saved location
 */
export function removeAutoFilledItems(
  days: DayItinerary[],
  locationId: string
): DayItinerary[] {
  return days.map((day) => ({
    ...day,
    customItems: day.customItems.filter(
      (item) => !(item.isAutoFilled && item.autoFillSource === locationId)
    ) as ItineraryItem[],
  }));
}

/**
 * Update auto-filled items when primary location changes
 */
export function updateAutoFilledItems(
  days: DayItinerary[],
  oldLocationId: string,
  newLocation: SavedLocation
): DayItinerary[] {
  return days.map((day) => ({
    ...day,
    customItems: day.customItems.map((item) => {
      if (item.isAutoFilled && item.autoFillSource === oldLocationId) {
        // Update with new location
        return {
          ...item,
          location: newLocation.location,
          autoFillSource: newLocation.id,
        };
      }
      return item;
    }) as ItineraryItem[],
  }));
}

/**
 * Sync consecutive days (copy last item of previous day to first item of current day)
 */
export function syncConsecutiveDays(
  previousDay: DayItinerary,
  currentDay: DayItinerary,
  syncMode: 'forward' | 'backward'
): { previousDay: DayItinerary; currentDay: DayItinerary } {
  const prevItems = [...previousDay.customItems] as ItineraryItem[];
  const currItems = [...currentDay.customItems] as ItineraryItem[];

  if (syncMode === 'forward') {
    // Copy last item of previous day to first item of current day
    const lastItem = prevItems[prevItems.length - 1];
    if (lastItem && lastItem.location) {
      const firstItem = currItems[0];
      if (firstItem) {
        currItems[0] = {
          ...firstItem,
          location: lastItem.location,
        };
      }
    }
  } else {
    // Copy first item of current day to last item of previous day
    const firstItem = currItems[0];
    if (firstItem && firstItem.location) {
      const lastItem = prevItems[prevItems.length - 1];
      if (lastItem) {
        prevItems[prevItems.length - 1] = {
          ...lastItem,
          location: firstItem.location,
        };
      }
    }
  }

  return {
    previousDay: { ...previousDay, customItems: prevItems },
    currentDay: { ...currentDay, customItems: currItems },
  };
}

/**
 * Detect disconnected days (last location of day N != first location of day N+1)
 */
export function detectDisconnectedDays(
  days: DayItinerary[]
): Array<{
  dayNumber: number;
  lastLocation: string;
  nextLocation: string;
}> {
  const disconnected: Array<{
    dayNumber: number;
    lastLocation: string;
    nextLocation: string;
  }> = [];

  for (let i = 0; i < days.length - 1; i++) {
    const currentDay = days[i];
    const nextDay = days[i + 1];

    const currentItems = currentDay.customItems as ItineraryItem[];
    const nextItems = nextDay.customItems as ItineraryItem[];

    if (currentItems.length === 0 || nextItems.length === 0) continue;

    const lastLocation = currentItems[currentItems.length - 1].location;
    const firstLocation = nextItems[0].location;

    if (lastLocation && firstLocation && !locationsMatch(lastLocation, firstLocation)) {
      disconnected.push({
        dayNumber: nextDay.dayNumber,
        lastLocation: lastLocation.address,
        nextLocation: firstLocation.address,
      });
    }
  }

  return disconnected;
}

/**
 * Count auto-filled items for a specific saved location
 */
export function countAutoFilledItems(
  days: DayItinerary[],
  locationId: string
): number {
  return days.reduce((count, day) => {
    const autoFilled = day.customItems.filter(
      (item) => item.isAutoFilled && item.autoFillSource === locationId
    );
    return count + autoFilled.length;
  }, 0);
}
