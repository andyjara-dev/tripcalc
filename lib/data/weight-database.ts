import { getAllCommonItems } from '@/data/luggage/common-items';
import type { CommonItem } from '@/lib/types/packing';

/**
 * Searches for an item by name in the static database
 * Supports both English and Spanish names
 * Case-insensitive, partial matching
 */
export function searchItemWeight(
  itemName: string,
  locale: string = 'en'
): CommonItem | null {
  const searchTerm = itemName.toLowerCase().trim();
  const items = getAllCommonItems();

  // Exact match first (prioritize)
  const exactMatch = items.find((item) => {
    const name = locale === 'es' ? item.nameES : item.name;
    return name.toLowerCase() === searchTerm;
  });

  if (exactMatch) return exactMatch;

  // Partial match
  const partialMatch = items.find((item) => {
    const name = locale === 'es' ? item.nameES : item.name;
    return name.toLowerCase().includes(searchTerm) || searchTerm.includes(name.toLowerCase());
  });

  return partialMatch || null;
}

/**
 * Gets autocomplete suggestions for an item query
 * Returns items that match the query (both EN and ES)
 */
export function getItemSuggestions(
  query: string,
  locale: string = 'en',
  limit: number = 8
): CommonItem[] {
  if (query.length < 2) return [];

  const searchTerm = query.toLowerCase().trim();
  const items = getAllCommonItems();

  // Find matches (prioritize exact matches, then prefix matches, then contains)
  const exactMatches: CommonItem[] = [];
  const prefixMatches: CommonItem[] = [];
  const containsMatches: CommonItem[] = [];

  items.forEach((item) => {
    const name = locale === 'es' ? item.nameES : item.name;
    const nameLower = name.toLowerCase();

    if (nameLower === searchTerm) {
      exactMatches.push(item);
    } else if (nameLower.startsWith(searchTerm)) {
      prefixMatches.push(item);
    } else if (nameLower.includes(searchTerm)) {
      containsMatches.push(item);
    }
  });

  // Combine results (exact first, then prefix, then contains)
  const results = [...exactMatches, ...prefixMatches, ...containsMatches];

  // Remove duplicates and limit
  const uniqueResults = Array.from(new Set(results));
  return uniqueResults.slice(0, limit);
}

/**
 * Gets all unique categories from the database
 */
export function getItemCategories(locale: string = 'en'): string[] {
  const items = getAllCommonItems();
  const categories = new Set(items.map((item) => item.category));
  return Array.from(categories).sort();
}

/**
 * Gets all items in a specific category
 */
export function getItemsByCategory(
  category: string,
  locale: string = 'en'
): CommonItem[] {
  const items = getAllCommonItems();
  return items.filter((item) => item.category === category);
}

/**
 * Gets the localized name for an item
 */
export function getLocalizedItemName(item: CommonItem, locale: string): string {
  return locale === 'es' ? item.nameES : item.name;
}
