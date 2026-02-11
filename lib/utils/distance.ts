/**
 * Distance Calculation Utilities
 * Uses Haversine formula for great-circle distance
 */

/**
 * Calculate straight-line distance between two coordinates
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 * Returns string like "1.2 km" or "350 m"
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Estimate walking time in minutes
 * Assumes average walking speed of 5 km/h
 */
export function estimateWalkingTime(km: number): number {
  const walkingSpeedKmH = 5;
  return Math.round((km / walkingSpeedKmH) * 60);
}

/**
 * Generate Google Maps directions URL
 */
export function generateGoogleMapsUrl(
  originLat: number,
  originLon: number,
  destLat: number,
  destLon: number,
  travelMode: 'walking' | 'transit' | 'driving' | 'bicycling' = 'walking'
): string {
  const params = new URLSearchParams({
    api: '1',
    origin: `${originLat},${originLon}`,
    destination: `${destLat},${destLon}`,
    travelmode: travelMode,
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
