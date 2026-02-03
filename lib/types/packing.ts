/**
 * Enhanced packing item type with support for both AI-generated and manual items
 */
export type PackingItem = {
  id: string;              // Unique identifier (nanoid)
  category: string;        // Existing or custom category
  name: string;           // Item name
  quantity: number;       // Number of items
  weightPerItem: number;  // Weight in grams per item
  totalWeight: number;    // Total weight in grams (auto-calculated)
  essential: boolean;     // Whether item is essential
  notes?: string;         // Optional notes
  packed?: boolean;       // Whether item is packed (for checklist)
  source: 'ai' | 'manual'; // Origin tracking
};

/**
 * Legacy packing item type (for backward compatibility)
 */
export type LegacyPackingItem = Omit<PackingItem, 'id' | 'source'> & {
  id?: string;
  source?: 'ai' | 'manual';
};

/**
 * Weight suggestion response from API
 */
export type WeightSuggestion = {
  weight: number;         // Suggested weight in grams
  confidence: 'high' | 'medium' | 'low'; // Confidence level
  source: 'database' | 'ai' | 'cache'; // Source of suggestion
  notes?: string;         // Optional explanation
};

/**
 * Common item from static database
 */
export type CommonItem = {
  name: string;           // English name
  nameES: string;         // Spanish name
  weight: number;         // Weight in grams
  category: string;       // Category key
  notes?: string;         // Optional notes
};

/**
 * Category of common items
 */
export type ItemCategory =
  | 'Clothing'
  | 'Shoes'
  | 'Electronics'
  | 'Toiletries'
  | 'Accessories'
  | 'Documents'
  | 'Other';
