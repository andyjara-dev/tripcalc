/**
 * City Service Layer
 * Provides unified access to city data with dual-source support:
 * 1. Try database first (new system)
 * 2. Fallback to static files (legacy system)
 */

import { prisma } from '@/lib/db';
import { getCityById as getStaticCity } from '@/data/cities';
import type { CityData } from '@/data/cities/types';

// Helper to convert cents back to currency units
function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Get a single city by ID
 * Tries database first, falls back to static files
 */
export async function getCity(cityId: string): Promise<CityData | null> {
  // Try database first
  const dbCity = await getCityFromDatabase(cityId);
  if (dbCity) {
    return dbCity;
  }

  // Fallback to static files
  const staticCity = getStaticCity(cityId);
  return staticCity || null;
}

/**
 * Get all published cities
 * Merges database cities with static cities (DB takes priority)
 */
export async function getAllCities(): Promise<CityData[]> {
  const dbCities = await getAllCitiesFromDatabase();
  const staticCities = await getAllStaticCities();

  // Merge, prioritizing database cities
  const dbCityIds = new Set(dbCities.map((c) => c.id));
  const uniqueStaticCities = staticCities.filter((c) => !dbCityIds.has(c.id));

  return [...dbCities, ...uniqueStaticCities];
}

/**
 * Get a city from the database
 */
export async function getCityFromDatabase(cityId: string): Promise<CityData | null> {
  try {
    const city = await prisma.city.findUnique({
      where: {
        id: cityId,
        isPublished: true, // Only return published cities
      },
      include: {
        dailyCosts: {
          where: {
            // Get current costs (no expiration or future expiration)
            OR: [{ validUntil: null }, { validUntil: { gt: new Date() } }],
          },
        },
        transport: {
          where: {
            OR: [{ validUntil: null }, { validUntil: { gt: new Date() } }],
          },
        },
        airports: true,
        tips: {
          orderBy: { order: 'asc' },
        },
        cashInfo: true,
      },
    });

    if (!city) {
      return null;
    }

    // Convert database format to CityData format
    return convertDbCityToCityData(city);
  } catch (error) {
    console.error(`Error fetching city ${cityId} from database:`, error);
    return null;
  }
}

/**
 * Get all cities from the database
 */
export async function getAllCitiesFromDatabase(): Promise<CityData[]> {
  try {
    const cities = await prisma.city.findMany({
      where: {
        isPublished: true,
      },
      include: {
        dailyCosts: {
          where: {
            OR: [{ validUntil: null }, { validUntil: { gt: new Date() } }],
          },
        },
        transport: {
          where: {
            OR: [{ validUntil: null }, { validUntil: { gt: new Date() } }],
          },
        },
        airports: true,
        tips: {
          orderBy: { order: 'asc' },
        },
        cashInfo: true,
      },
      orderBy: { name: 'asc' },
    });

    return cities.map(convertDbCityToCityData);
  } catch (error) {
    console.error('Error fetching cities from database:', error);
    return [];
  }
}

/**
 * Get all static cities (for fallback)
 */
async function getAllStaticCities(): Promise<CityData[]> {
  try {
    // Import all static cities
    const { barcelona } = await import('@/data/cities/barcelona');
    const { tokyo } = await import('@/data/cities/tokyo');
    const { paris } = await import('@/data/cities/paris');
    const { newYork } = await import('@/data/cities/new-york');
    const { mexicoCity } = await import('@/data/cities/mexico-city');

    return [barcelona, tokyo, paris, newYork, mexicoCity];
  } catch (error) {
    console.error('Error loading static cities:', error);
    return [];
  }
}

/**
 * Convert database city model to CityData interface
 */
function convertDbCityToCityData(city: any): CityData {
  // Convert daily costs
  const dailyCosts: any = {
    budget: { accommodation: 0, food: 0, transport: 0, activities: 0 },
    midRange: { accommodation: 0, food: 0, transport: 0, activities: 0 },
    luxury: { accommodation: 0, food: 0, transport: 0, activities: 0 },
  };

  for (const cost of city.dailyCosts) {
    dailyCosts[cost.travelStyle] = {
      accommodation: fromCents(cost.accommodation),
      food: fromCents(cost.food),
      transport: fromCents(cost.transport),
      activities: fromCents(cost.activities),
    };
  }

  // Convert transport to grouped structure
  const transport: any = {};

  for (const t of city.transport) {
    if (!transport[t.type]) {
      transport[t.type] = {};
    }

    // Map transport options back to original structure
    if (t.type === 'metro' || t.type === 'bus') {
      if (t.name.includes('Single')) {
        transport[t.type].singleTicket = fromCents(t.price);
      } else if (t.name.includes('Day Pass')) {
        transport[t.type].dayPass = fromCents(t.price);
      } else if (t.name.includes('T-Casual') || t.name.includes('rides')) {
        const ridesMatch = t.name.match(/(\d+)\s+rides/);
        transport[t.type].multiTicket = {
          rides: ridesMatch ? parseInt(ridesMatch[1]) : 10,
          price: fromCents(t.price),
        };
      }
    } else if (t.type === 'taxi') {
      if (t.name.includes('Base')) {
        transport[t.type].baseRate = fromCents(t.price);
      } else if (t.name.includes('Kilometer')) {
        transport[t.type].perKm = fromCents(t.price);
      } else if (t.name.includes('Minute')) {
        transport[t.type].perMinute = fromCents(t.price);
      }
    } else if (t.type === 'uber') {
      transport[t.type] = {
        available: true,
        averageAirportToCity: fromCents(t.price),
      };
    } else if (t.type === 'train') {
      transport[t.type] = {
        airportToCity: fromCents(t.price),
      };
    }
  }

  // Convert tips to object structure
  const tips: any = {
    restaurants: '',
    cafes: '',
    taxis: '',
    general: '',
  };

  for (const tip of city.tips) {
    tips[tip.category] = tip.content;
  }

  // Convert cash info
  const cash: any = {
    widelyAccepted: city.cashInfo?.cashNeeded === 'low',
    atmAvailability: city.cashInfo?.atmAvailability || 'common',
    atmFees: city.cashInfo?.atmFees,
    recommendedAmount: city.cashInfo?.recommendations || '',
  };

  return {
    id: city.id,
    name: city.name,
    country: city.country,
    currency: city.currency,
    currencySymbol: city.currencySymbol,
    language: city.language,
    latitude: city.latitude,
    longitude: city.longitude,
    transport,
    dailyCosts,
    tips,
    cash,
    hiddenCosts: [], // TODO: Add hidden costs to database if needed
    lastUpdated: city.lastUpdated,
  };
}

/**
 * Get city names for listing (lightweight query)
 */
export async function getCityNames(): Promise<Array<{ id: string; name: string; country: string }>> {
  try {
    const dbCities = await prisma.city.findMany({
      where: { isPublished: true },
      select: { id: true, name: true, country: true },
      orderBy: { name: 'asc' },
    });

    if (dbCities.length > 0) {
      return dbCities;
    }

    // Fallback to static cities
    const allCities = await getAllStaticCities();
    return allCities.map((c) => ({ id: c.id, name: c.name, country: c.country }));
  } catch (error) {
    console.error('Error fetching city names:', error);
    const allCities = await getAllStaticCities();
    return allCities.map((c) => ({ id: c.id, name: c.name, country: c.country }));
  }
}

/**
 * Check if a city exists (in DB or static files)
 */
export async function cityExists(cityId: string): Promise<boolean> {
  const city = await getCity(cityId);
  return city !== null;
}
