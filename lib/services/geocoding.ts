/**
 * Geocoding Service
 * Uses Nominatim (OpenStreetMap) for geocoding addresses
 * Free, no API key required, 1 request per second limit
 */

import type { GeoLocation } from '@/lib/types/itinerary';

// Nominatim API base URL
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// User agent (required by Nominatim)
const USER_AGENT = 'TripCalc/1.0 (https://tripcalc.site)';

// Cache duration (30 days in milliseconds)
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;

// In-memory cache (TODO: move to Redis for production)
interface CacheEntry {
  data: GeoLocation;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

// Rate limiting: simple in-memory tracker
const rateLimiter = new Map<string, number[]>();

/**
 * City bounds for biasing results
 */
export interface CityBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Check if user has exceeded rate limit
 * 50 requests per hour per user
 */
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  // Get recent requests for this user
  let requests = rateLimiter.get(userId) || [];

  // Filter requests from the last hour
  requests = requests.filter(timestamp => timestamp > oneHourAgo);

  // Update rate limiter
  rateLimiter.set(userId, requests);

  // Check if exceeded limit
  if (requests.length >= 50) {
    return false;
  }

  // Add current request
  requests.push(now);
  rateLimiter.set(userId, requests);

  return true;
}

/**
 * Generate cache key
 */
function getCacheKey(address: string, cityBounds?: CityBounds): string {
  const boundsStr = cityBounds
    ? `${cityBounds.north},${cityBounds.south},${cityBounds.east},${cityBounds.west}`
    : 'no-bounds';
  return `${address.toLowerCase().trim()}:${boundsStr}`;
}

/**
 * Get cached result if available and not expired
 */
function getCached(cacheKey: string): GeoLocation | null {
  const entry = cache.get(cacheKey);

  if (!entry) {
    return null;
  }

  // Check if expired
  if (Date.now() - entry.timestamp > CACHE_DURATION) {
    cache.delete(cacheKey);
    return null;
  }

  return entry.data;
}

/**
 * Set cache entry
 */
function setCache(cacheKey: string, data: GeoLocation): void {
  cache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Clean up expired cache entries (run periodically)
 */
export function cleanupGeocodingCache(): void {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
}

// Run cleanup every hour
if (typeof window === 'undefined') {
  // Only on server
  setInterval(cleanupGeocodingCache, 60 * 60 * 1000);
}

/**
 * Geocode an address using Nominatim
 */
export async function geocode(
  address: string,
  userId: string,
  cityBounds?: CityBounds
): Promise<GeoLocation> {
  // Validate input
  if (!address || address.trim().length < 3) {
    throw new Error('Address must be at least 3 characters');
  }

  // Check rate limit
  if (!checkRateLimit(userId)) {
    throw new Error('RATE_LIMIT_EXCEEDED');
  }

  // Check cache
  const cacheKey = getCacheKey(address, cityBounds);
  const cached = getCached(cacheKey);
  if (cached) {
    return cached;
  }

  // Build query params
  const params = new URLSearchParams({
    q: address,
    format: 'json',
    limit: '1',
    addressdetails: '1',
    // Enable searching for POIs (airports, monuments, etc.)
    'accept-language': 'en',
    // Include various place types
    featuretype: 'settlement,country,city,state,street,poi',
  });

  // Add viewbox for biasing results (if city bounds provided)
  if (cityBounds) {
    params.append('viewbox', `${cityBounds.west},${cityBounds.north},${cityBounds.east},${cityBounds.south}`);
    params.append('bounded', '1'); // Restrict results to viewbox
  }

  // Make request
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
      headers: {
        'User-Agent': USER_AGENT,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const results = await response.json();

    if (!results || results.length === 0) {
      throw new Error('ADDRESS_NOT_FOUND');
    }

    const result = results[0];

    // Parse result
    const geoLocation: GeoLocation = {
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      address: result.display_name,
      placeId: result.place_id?.toString(),
    };

    // Cache result
    setCache(cacheKey, geoLocation);

    // Respect Nominatim rate limit (1 req/second)
    await new Promise(resolve => setTimeout(resolve, 1000));

    return geoLocation;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('GEOCODING_TIMEOUT');
      }
      throw error;
    }

    throw new Error('GEOCODING_FAILED');
  }
}

/**
 * Reverse geocode coordinates to address
 * (Phase 2: for manual pin placement on map)
 */
export async function reverseGeocode(
  lat: number,
  lon: number,
  userId: string
): Promise<GeoLocation> {
  // Check rate limit
  if (!checkRateLimit(userId)) {
    throw new Error('RATE_LIMIT_EXCEEDED');
  }

  // Check cache
  const cacheKey = `reverse:${lat.toFixed(6)},${lon.toFixed(6)}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return cached;
  }

  // Build query params
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    format: 'json',
    addressdetails: '1',
  });

  // Make request
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params}`, {
      headers: {
        'User-Agent': USER_AGENT,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const result = await response.json();

    if (!result || result.error) {
      throw new Error('ADDRESS_NOT_FOUND');
    }

    // Parse result
    const geoLocation: GeoLocation = {
      lat,
      lon,
      address: result.display_name,
      placeId: result.place_id?.toString(),
    };

    // Cache result
    setCache(cacheKey, geoLocation);

    // Respect rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));

    return geoLocation;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('GEOCODING_TIMEOUT');
      }
      throw error;
    }

    throw new Error('GEOCODING_FAILED');
  }
}
