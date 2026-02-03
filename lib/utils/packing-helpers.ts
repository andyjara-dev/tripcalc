import { nanoid } from 'nanoid';
import type { PackingItem, LegacyPackingItem } from '@/lib/types/packing';

/**
 * Normalizes packing items to ensure all have id and source fields
 * Provides backward compatibility with old saved lists
 */
export function normalizePackingItems(items: LegacyPackingItem[]): PackingItem[] {
  return items.map((item) => ({
    id: item.id || nanoid(),
    category: item.category,
    name: item.name,
    quantity: item.quantity,
    weightPerItem: item.weightPerItem,
    totalWeight: item.totalWeight,
    essential: item.essential,
    notes: item.notes,
    packed: item.packed || false,
    source: item.source || 'ai', // Default to 'ai' for legacy items
  }));
}

/**
 * Calculates total weight for an item
 */
export function calculateItemWeight(quantity: number, weightPerItem: number): number {
  return quantity * weightPerItem;
}

/**
 * Validates weight value (must be between 10g and 50kg)
 */
export function isValidWeight(weight: number): boolean {
  return weight >= 10 && weight <= 50000;
}

/**
 * Formats weight for display (converts grams to kg if needed)
 */
export function formatWeight(grams: number, locale: string = 'en'): string {
  if (grams >= 1000) {
    const kg = grams / 1000;
    return new Intl.NumberFormat(locale, {
      style: 'decimal',
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    }).format(kg) + ' kg';
  }
  return Math.round(grams) + ' g';
}

/**
 * Extracts unique categories from items
 */
export function getUniqueCategories(items: PackingItem[]): string[] {
  const categories = new Set(items.map(item => item.category));
  return Array.from(categories).sort();
}

/**
 * Groups items by category
 */
export function groupItemsByCategory(items: PackingItem[]): Record<string, PackingItem[]> {
  return items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PackingItem[]>);
}

/**
 * Calculates total weight of all items
 */
export function calculateTotalWeight(items: PackingItem[]): number {
  return items.reduce((total, item) => total + item.totalWeight, 0);
}

/**
 * Creates a new packing item with defaults
 */
export function createPackingItem(
  name: string,
  category: string,
  weightPerItem: number,
  quantity: number = 1,
  essential: boolean = false,
  notes?: string
): PackingItem {
  return {
    id: nanoid(),
    category,
    name,
    quantity,
    weightPerItem,
    totalWeight: calculateItemWeight(quantity, weightPerItem),
    essential,
    notes,
    packed: false,
    source: 'manual',
  };
}

/**
 * Updates an existing packing item
 */
export function updatePackingItem(
  item: PackingItem,
  updates: Partial<Omit<PackingItem, 'id' | 'source'>>
): PackingItem {
  const updated = { ...item, ...updates };

  // Recalculate totalWeight if quantity or weightPerItem changed
  if (updates.quantity !== undefined || updates.weightPerItem !== undefined) {
    updated.totalWeight = calculateItemWeight(updated.quantity, updated.weightPerItem);
  }

  return updated;
}
