/**
 * Geolocation utilities
 * Get country/city from IP address
 */

import { createHash } from 'crypto';

export interface GeolocationData {
  country?: string;
  city?: string;
  region?: string;
  ipHash?: string;
}

/**
 * Hash IP address for privacy (SHA256)
 */
export function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex');
}

/**
 * Get geolocation from request headers (Vercel)
 * Vercel provides these headers automatically
 */
export function getGeolocationFromHeaders(headers: Headers): GeolocationData {
  const country = headers.get('x-vercel-ip-country') || undefined;
  const city = headers.get('x-vercel-ip-city') || undefined;
  const region = headers.get('x-vercel-ip-country-region') || undefined;
  const ip = headers.get('x-forwarded-for')?.split(',')[0] || headers.get('x-real-ip');

  return {
    country,
    city,
    region,
    ipHash: ip ? hashIP(ip) : undefined,
  };
}

/**
 * Get geolocation from IP using external API (fallback)
 * Uses ipapi.co (free tier: 30k requests/month)
 */
export async function getGeolocationFromIP(ip: string): Promise<GeolocationData> {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error('Geolocation API error');
    }

    const data = await response.json();

    return {
      country: data.country_code || undefined,
      city: data.city || undefined,
      region: data.region || undefined,
      ipHash: hashIP(ip),
    };
  } catch (error) {
    console.error('Geolocation error:', error);
    return {
      ipHash: hashIP(ip),
    };
  }
}

/**
 * Get user agent info
 */
export function getUserAgent(headers: Headers): string | undefined {
  return headers.get('user-agent') || undefined;
}

/**
 * Parse locale from request
 */
export function getLocaleFromRequest(headers: Headers, pathname?: string): string {
  // Try to get from pathname first (/en/... or /es/...)
  if (pathname) {
    const match = pathname.match(/^\/(en|es)\//);
    if (match) {
      return match[1];
    }
  }

  // Fallback to Accept-Language header
  const acceptLanguage = headers.get('accept-language');
  if (acceptLanguage) {
    if (acceptLanguage.includes('es')) return 'es';
    if (acceptLanguage.includes('en')) return 'en';
  }

  return 'en'; // Default
}
