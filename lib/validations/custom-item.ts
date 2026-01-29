import { z } from 'zod';

export const customItemSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long'),
  category: z.enum(['ACCOMMODATION', 'FOOD', 'TRANSPORT', 'ACTIVITIES', 'SHOPPING', 'OTHER']),
  amount: z.number()
    .int('Must be whole cents')
    .positive('Price must be positive')
    .max(1000000, 'Price too high'), // Max $10k
  currency: z.string().length(3, 'Invalid currency code'),
  notes: z.string().max(500, 'Notes too long').optional(),
  visits: z.number().int().positive().max(50).default(1).optional(),
  isOneTime: z.boolean().default(true).optional(),
});

export type CustomItemInput = z.infer<typeof customItemSchema>;

// Client-side type for localStorage (without DB fields)
export interface CustomItemLocal {
  id: string;              // nanoid temp ID
  category: 'ACCOMMODATION' | 'FOOD' | 'TRANSPORT' | 'ACTIVITIES' | 'SHOPPING' | 'OTHER';
  name: string;
  amount: number;          // In cents
  visits: number;          // Total number of times during the entire trip (not per day)
  isOneTime: boolean;      // Deprecated: kept for backward compatibility, not used in calculations
  notes?: string;
}

// Normalization helpers for analytics
export function normalizeItemName(rawName: string): string {
  return rawName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

// Prepare CustomItemLocal for DB insertion (Phase 2)
// This will be used when saving to database with analytics fields
export function prepareItemForDB(
  item: CustomItemLocal,
  cityId: string,
  userLocale: string
): CustomItemInput & {
  normalizedName: string;
  cityId: string;
  userLocale: string;
} {
  return {
    name: item.name,
    category: item.category,
    amount: item.amount,
    currency: 'USD', // TODO: Get from city data
    notes: item.notes,
    visits: item.visits,
    isOneTime: item.isOneTime,
    // Analytics fields
    normalizedName: normalizeItemName(item.name),
    cityId,
    userLocale,
  };
}

// Backward compatibility alias
export const normalizeActivityName = normalizeItemName;
