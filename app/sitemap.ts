import { MetadataRoute } from 'next';
import { getAllCities } from '@/data/cities';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tripcalc.site';
  const locales = ['en', 'es'];
  const cities = getAllCities();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  // Homepage
  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    });
  }

  // Cities index
  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}/cities`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    });
  }

  // Individual city pages
  for (const city of cities) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}/cities/${city.id}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  }

  // Calculators
  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}/calculators/luggage`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  // About
  for (const locale of locales) {
    entries.push({
      url: `${baseUrl}/${locale}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    });
  }

  return entries;
}
