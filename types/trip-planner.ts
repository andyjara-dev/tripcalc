// Day-by-Day Trip Planner Types

// Import and re-export CustomItemLocal from validations (single source of truth)
import type { CustomItemLocal } from '@/lib/validations/custom-item';
export type { CustomItemLocal };

export type TripStyle = 'budget' | 'midRange' | 'luxury';

export type ItemCategory = 'ACCOMMODATION' | 'FOOD' | 'TRANSPORT' | 'ACTIVITIES' | 'SHOPPING' | 'OTHER';

export interface CategoryIncluded {
  accommodation: boolean;
  food: boolean;
  transport: boolean;
  activities: boolean;
}

export interface CustomCosts {
  accommodation: number | null;  // null = use default, number = custom cost
  food: number | null;
  transport: number | null;
  activities: number | null;
}

export interface DayPlan {
  dayNumber: number;           // 1, 2, 3...
  date?: string;               // "2024-02-15" (optional)
  dayName?: string;            // "Arrival Day", "Museum Day" (optional)

  // Categories to include (checkboxes)
  included: CategoryIncluded;

  // Override base costs (deprecated, use includeBase instead)
  customCosts?: CustomCosts;

  // Custom activities/items for this specific day
  customItems: CustomItemLocal[];

  // Include base estimates for each category
  includeBase: {
    accommodation: boolean;
    food: boolean;
    transport: boolean;
    activities: boolean;
  };
}

export interface TripPlanDetailed {
  cityId: string;
  tripStyle: TripStyle;
  days: DayPlan[];

  // Optional: saved locations for this trip (stored in calculatorState)
  savedLocations?: any[]; // Type will be SavedLocation[] but avoid circular dependency
}

// Helper to create a default day
export function createDefaultDay(dayNumber: number, baseIncluded: CategoryIncluded = {
  accommodation: true,
  food: true,
  transport: true,
  activities: true,
}): DayPlan {
  return {
    dayNumber,
    included: { ...baseIncluded },
    customItems: [],
    includeBase: {
      accommodation: true,
      food: true,
      transport: true,
      activities: true,
    },
  };
}

// Helper to calculate cost for a specific day
export function calculateDayCost(
  day: DayPlan,
  baseCosts: {
    accommodation: number;
    food: number;
    transport: number;
    activities: number;
  }
): number {
  let total = 0;

  // Helper to calculate custom items for a category
  const getCustomItemsTotal = (category: ItemCategory): number => {
    return day.customItems
      .filter(item => item.category === category)
      .reduce((sum, item) => sum + (item.amount * item.visits), 0) / 100;
  };

  // Accommodation
  if (day.included.accommodation) {
    total += day.includeBase.accommodation ? baseCosts.accommodation : 0;
    total += getCustomItemsTotal('ACCOMMODATION');
  }

  // Food
  if (day.included.food) {
    total += day.includeBase.food ? baseCosts.food : 0;
    total += getCustomItemsTotal('FOOD');
  }

  // Transport
  if (day.included.transport) {
    total += day.includeBase.transport ? baseCosts.transport : 0;
    total += getCustomItemsTotal('TRANSPORT');
  }

  // Activities
  if (day.included.activities) {
    total += day.includeBase.activities ? baseCosts.activities : 0;
    total += getCustomItemsTotal('ACTIVITIES');
  }

  return total;
}

// Helper to calculate total trip cost
export function calculateTripTotal(
  days: DayPlan[],
  baseCosts: {
    accommodation: number;
    food: number;
    transport: number;
    activities: number;
  }
): number {
  return days.reduce((sum, day) => sum + calculateDayCost(day, baseCosts), 0);
}
