/**
 * Zod validation schemas for city data
 * Used for admin API validation
 */

import { z } from 'zod';

/**
 * Main city schema
 */
export const citySchema = z.object({
  id: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'ID must be lowercase letters, numbers, and hyphens only'),
  name: z.string().min(2).max(100),
  country: z.string().min(2).max(100),
  region: z.string().optional(),

  // Currency
  currency: z.string().length(3, 'Currency must be 3-letter ISO code (e.g., EUR, USD)'),
  currencySymbol: z.string().max(5),

  // Metadata
  language: z.string().min(2),
  timezone: z.string().optional(),
  population: z.number().int().positive().optional(),
  touristSeason: z.string().optional(),

  // SEO
  description: z.string().max(1000).optional(),
  metaTitle: z.string().min(10).max(60).optional(),
  metaDescription: z.string().min(50).max(160).optional(),

  // Media
  imageUrl: z.string().url().optional().or(z.literal('')),
  imageCredit: z.string().max(200).optional(),

  // Status
  isPublished: z.boolean().default(false),
  lastUpdated: z.string().regex(/^\d{4}-\d{2}$/, 'Format must be YYYY-MM'),
});

export type CityInput = z.infer<typeof citySchema>;

/**
 * City update schema (all fields optional except ID)
 */
export const cityUpdateSchema = citySchema.partial().required({ id: true });

/**
 * Daily cost schema
 */
export const dailyCostSchema = z.object({
  travelStyle: z.enum(['budget', 'midRange', 'luxury']),
  accommodation: z.number().int().positive(), // in cents
  food: z.number().int().positive(),
  transport: z.number().int().positive(),
  activities: z.number().int().positive(),
  breakfast: z.number().int().positive().optional(),
  lunch: z.number().int().positive().optional(),
  dinner: z.number().int().positive().optional(),
  snacks: z.number().int().positive().optional(),
});

export type DailyCostInput = z.infer<typeof dailyCostSchema>;

/**
 * Transport option schema
 */
export const transportSchema = z.object({
  type: z.string().min(2).max(50), // "metro", "taxi", "uber", etc.
  name: z.string().min(2).max(100),
  price: z.number().int().positive(), // in cents
  priceNote: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  tips: z.string().max(500).optional(),
  bookingUrl: z.string().url().optional().or(z.literal('')),
});

export type TransportInput = z.infer<typeof transportSchema>;

/**
 * Airport schema
 */
export const airportSchema = z.object({
  code: z.string().length(3, 'Airport code must be 3 letters').toUpperCase(),
  name: z.string().min(3).max(100),
  transfers: z.array(
    z.object({
      type: z.string(), // "train", "bus", "taxi", "uber"
      name: z.string(),
      price: z.number().positive(),
      duration: z.number().positive().optional(), // in minutes
      frequency: z.string().optional(), // "Every 10 min", "Hourly"
      tips: z.string().optional(),
    })
  ),
});

export type AirportInput = z.infer<typeof airportSchema>;

/**
 * Tip schema
 */
export const tipSchema = z.object({
  category: z.string().min(2).max(50), // "payment", "safety", "culture", etc.
  title: z.string().min(2).max(100),
  content: z.string().min(10).max(1000),
  order: z.number().int().min(0).default(0),
});

export type TipInput = z.infer<typeof tipSchema>;

/**
 * Cash info schema
 */
export const cashInfoSchema = z.object({
  cashNeeded: z.enum(['low', 'medium', 'high']),
  cardsAccepted: z.enum(['widely', 'most-places', 'limited']),
  atmAvailability: z.enum(['everywhere', 'common', 'limited']),
  recommendations: z.string().min(10).max(500),
  atmFees: z.string().max(200).optional(),
  bestExchange: z.string().max(200).optional(),
});

export type CashInfoInput = z.infer<typeof cashInfoSchema>;

/**
 * Complete city creation schema with all relations
 */
export const createCityWithRelationsSchema = z.object({
  city: citySchema,
  dailyCosts: z.array(dailyCostSchema).min(1).max(3).optional(),
  transport: z.array(transportSchema).optional(),
  airports: z.array(airportSchema).optional(),
  tips: z.array(tipSchema).optional(),
  cashInfo: cashInfoSchema.optional(),
});

export type CreateCityWithRelations = z.infer<typeof createCityWithRelationsSchema>;

/**
 * Publish/unpublish schema
 */
export const publishCitySchema = z.object({
  isPublished: z.boolean(),
});

/**
 * Bulk import schema for CSV/JSON imports
 */
export const bulkImportCitySchema = z.array(citySchema).min(1);

/**
 * Price update schema (for tracking history)
 */
export const priceUpdateSchema = z.object({
  category: z.string(), // "dailyCost", "transport", etc.
  field: z.string(), // "accommodation", "metro", etc.
  oldValue: z.number().int(),
  newValue: z.number().int(),
  reason: z.string().max(200).optional(),
});

export type PriceUpdate = z.infer<typeof priceUpdateSchema>;

/**
 * Helper to convert currency to cents
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Helper to convert cents to currency
 */
export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Validate currency format (basic check)
 */
export function isValidCurrency(code: string): boolean {
  const validCurrencies = ['EUR', 'USD', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'MXN', 'BRL'];
  return validCurrencies.includes(code.toUpperCase());
}
