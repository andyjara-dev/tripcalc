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
 * Get geolocation from request headers
 * Tries Vercel headers first, then standard headers
 */
export async function getGeolocationFromHeaders(headers: Headers): Promise<GeolocationData> {
  // Try Vercel headers first (if deployed on Vercel)
  let country = headers.get('x-vercel-ip-country') || undefined;
  let city = headers.get('x-vercel-ip-city') || undefined;
  let region = headers.get('x-vercel-ip-country-region') || undefined;

  // Get IP from headers (works with Docker/nginx reverse proxy)
  const ip = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || headers.get('x-real-ip')
    || headers.get('cf-connecting-ip'); // CloudFlare

  // If no Vercel headers and we have an IP, use ipapi.co
  if (!country && ip && ip !== '::1' && ip !== '127.0.0.1' && !ip.startsWith('192.168.')) {
    try {
      const geoData = await getGeolocationFromIP(ip);
      return geoData;
    } catch (error) {
      console.error('Failed to get geolocation:', error);
    }
  }

  // Fallback for localhost/development
  if (!country) {
    country = 'LOCAL';
  }

  return {
    country,
    city,
    region,
    ipHash: ip ? hashIP(ip) : 'localhost',
  };
}

/**
 * Get geolocation from IP using external API (fallback)
 * Uses ipapi.co (free tier: 30k requests/month)
 */
export async function getGeolocationFromIP(ip: string): Promise<GeolocationData> {
  try {
    // Timeout de 20 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    let response;
    try {
      response = await fetch(`https://ipapi.co/${ip}/json/`, {
        signal: controller.signal,
        next: { revalidate: 86400 }, // Cache for 24 hours
      });
      clearTimeout(timeoutId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Geolocation fetch error:', fetchError);
      throw fetchError;
    }

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
