/**
 * Utilities for handling trip cost calculations with custom overrides
 */

interface DailyCosts {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
}

interface Trip {
  budgetAccommodation?: number | null;
  budgetFood?: number | null;
  budgetTransport?: number | null;
  budgetActivities?: number | null;
}

/**
 * Get effective costs for a trip, using custom costs if set, otherwise city defaults
 * @param trip - Trip with optional custom budget fields (in cents)
 * @param cityDefaults - Default daily costs from city data (in currency units)
 * @returns Effective daily costs to use (in currency units)
 */
export function getEffectiveCosts(
  trip: Trip,
  cityDefaults: DailyCosts
): DailyCosts {
  return {
    accommodation: trip.budgetAccommodation
      ? trip.budgetAccommodation / 100
      : cityDefaults.accommodation,
    food: trip.budgetFood
      ? trip.budgetFood / 100
      : cityDefaults.food,
    transport: trip.budgetTransport
      ? trip.budgetTransport / 100
      : cityDefaults.transport,
    activities: trip.budgetActivities
      ? trip.budgetActivities / 100
      : cityDefaults.activities,
  };
}

/**
 * Check if a trip has any custom costs set
 * @param trip - Trip to check
 * @returns true if any custom budget is set
 */
export function hasCustomCosts(trip: Trip): boolean {
  return !!(
    trip.budgetAccommodation ||
    trip.budgetFood ||
    trip.budgetTransport ||
    trip.budgetActivities
  );
}

/**
 * Count how many custom costs are set
 * @param trip - Trip to check
 * @returns Number of custom costs (0-4)
 */
export function countCustomCosts(trip: Trip): number {
  let count = 0;
  if (trip.budgetAccommodation) count++;
  if (trip.budgetFood) count++;
  if (trip.budgetTransport) count++;
  if (trip.budgetActivities) count++;
  return count;
}
