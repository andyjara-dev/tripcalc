/**
 * Analytics Events
 * Type definitions and constants for tracking events
 */

// Event types
export type AnalyticsEventType =
  // Authentication
  | 'user_signup'
  | 'user_login'
  | 'user_logout'
  // Trips
  | 'trip_created'
  | 'trip_viewed'
  | 'trip_updated'
  | 'trip_deleted'
  | 'trip_shared'
  | 'trip_exported_pdf'
  | 'trip_exported_ical'
  // Calculators
  | 'calculator_used'
  | 'calculator_city_selected'
  | 'calculator_style_changed'
  // Weather
  | 'weather_card_viewed'
  | 'weather_alert_shown'
  | 'weather_alert_clicked'
  // Expenses
  | 'expense_added'
  | 'expense_updated'
  | 'expense_deleted'
  // Packing
  | 'packing_list_generated'
  | 'packing_list_saved'
  | 'packing_list_deleted'
  // UI Interactions
  | 'accordion_expanded'
  | 'dropdown_opened'
  | 'modal_opened'
  // Costs
  | 'costs_customized'
  | 'costs_reset_to_default'
  // Itinerary
  | 'itinerary_viewed'
  | 'itinerary_activity_added'
  | 'itinerary_activity_updated'
  | 'itinerary_activity_deleted'
  | 'itinerary_address_geocoded'
  | 'itinerary_geocoding_failed'
  | 'itinerary_tab_opened'
  // Page views
  | 'page_view';

// Event data interfaces
export interface UserSignupData {
  method: 'google' | 'github' | 'email';
  referrer?: string;
}

export interface TripCreatedData {
  cityId: string;
  tripStyle: 'BUDGET' | 'MID_RANGE' | 'LUXURY';
  days: number;
  hasCustomCosts: boolean;
}

export interface TripViewedData {
  tripId: string;
  cityId: string;
  days: number;
}

export interface TripUpdatedData {
  tripId: string;
  changes: string[]; // ['days', 'tripStyle', 'calculatorState']
}

export interface TripSharedData {
  tripId: string;
  method: 'link' | 'email';
}

export interface CalculatorUsedData {
  type: 'dayByDay' | 'quick';
  cityId: string;
  tripStyle?: string;
  days?: number;
}

export interface WeatherCardViewedData {
  cityId: string;
  days: number;
  hasAlerts: boolean;
  alertCount?: number;
}

export interface WeatherAlertShownData {
  cityId: string;
  alertCount: number;
  maxLevel: 'red' | 'orange' | 'yellow';
  alertTypes: string[];
}

export interface ExpenseAddedData {
  category: string;
  amountRange: string; // '<100', '100-500', '500-1000', '>1000'
}

export interface PackingListGeneratedData {
  preset?: string;
  duration: number;
  climate?: string;
  tripType: string;
  itemCount: number;
  totalWeight: number;
}

export interface AccordionExpandedData {
  section: 'dailyPlanning' | 'expensesTracking' | 'tripSummary';
}

export interface ModalOpenedData {
  modal: string; // 'share', 'customize', 'edit', 'expense', etc.
}

export interface CostsCustomizedData {
  categories: string[]; // ['accommodation', 'food']
}

export interface PageViewData {
  path: string;
  title?: string;
  referrer?: string;
  timeOnPage?: number;
}

export interface ItineraryViewedData {
  tripId: string;
  cityId: string;
  dayNumber: number;
  activitiesCount: number;
}

export interface ItineraryActivityAddedData {
  tripId: string;
  category: string;
  hasTime: boolean;
  hasLocation: boolean;
}

export interface ItineraryActivityUpdatedData {
  tripId: string;
  fields: string[]; // ['timeSlot', 'location', 'cost']
}

export interface ItineraryActivityDeletedData {
  tripId: string;
  hadTime: boolean;
  hadLocation: boolean;
}

export interface ItineraryAddressGeocodedData {
  tripId: string;
  success: boolean;
  cached?: boolean;
}

export interface ItineraryGeocodingFailedData {
  tripId: string;
  errorType: string; // 'NOT_FOUND' | 'RATE_LIMIT' | 'TIMEOUT' | 'OTHER'
}

export interface ItineraryTabOpenedData {
  tripId: string;
  isPremium: boolean;
}

// Union type for all event data
export type AnalyticsEventData =
  | UserSignupData
  | TripCreatedData
  | TripViewedData
  | TripUpdatedData
  | TripSharedData
  | CalculatorUsedData
  | WeatherCardViewedData
  | WeatherAlertShownData
  | ExpenseAddedData
  | PackingListGeneratedData
  | AccordionExpandedData
  | ModalOpenedData
  | CostsCustomizedData
  | PageViewData
  | ItineraryViewedData
  | ItineraryActivityAddedData
  | ItineraryActivityUpdatedData
  | ItineraryActivityDeletedData
  | ItineraryAddressGeocodedData
  | ItineraryGeocodingFailedData
  | ItineraryTabOpenedData
  | Record<string, any>;

// Helper to get amount range for privacy
export function getAmountRange(amount: number): string {
  if (amount < 100) return '<100';
  if (amount < 500) return '100-500';
  if (amount < 1000) return '500-1000';
  if (amount < 5000) return '1000-5000';
  return '>5000';
}

// Helper to sanitize event data (remove PII)
export function sanitizeEventData(
  eventType: AnalyticsEventType,
  data: any
): AnalyticsEventData {
  // Remove any PII fields
  const sanitized = { ...data };
  delete sanitized.email;
  delete sanitized.name;
  delete sanitized.phone;
  delete sanitized.ip;

  // Sanitize amounts (convert to ranges)
  if (sanitized.amount && typeof sanitized.amount === 'number') {
    sanitized.amountRange = getAmountRange(sanitized.amount);
    delete sanitized.amount;
  }

  return sanitized;
}
