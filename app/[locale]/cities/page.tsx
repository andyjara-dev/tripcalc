import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { getAllCities } from '@/data/cities';

export const metadata = {
  title: 'Cities - TripCalc',
  description: 'Browse travel cost calculators for cities worldwide.',
};

export default async function CitiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();
  const cities = getAllCities();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href={`/${locale}`} className="text-xl font-bold">
              {t('site.name')}
            </Link>
            <div className="hidden md:flex gap-6">
              <Link href={`/${locale}`} className="hover:text-gray-600">
                {t('nav.home')}
              </Link>
              <Link href={`/${locale}/cities`} className="hover:text-gray-600 font-semibold">
                {t('nav.cities')}
              </Link>
              <Link href={`/${locale}/about`} className="hover:text-gray-600">
                {t('nav.about')}
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cities</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Real travel costs, transport prices, and practical tips for cities around the world
          </p>
        </div>
      </section>

      {/* Cities Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => {
            const midRangeCost =
              city.dailyCosts.midRange.accommodation +
              city.dailyCosts.midRange.food +
              city.dailyCosts.midRange.transport +
              city.dailyCosts.midRange.activities;

            return (
              <Link
                key={city.id}
                href={`/${locale}/cities/${city.id}`}
                className="block bg-white border rounded-lg p-6 hover:shadow-lg transition group"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-2xl font-bold group-hover:text-blue-600 transition">
                      {city.name}
                    </h3>
                    <div className="text-gray-600">{city.country}</div>
                  </div>
                  <div className="text-2xl">🏙️</div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Currency:</span>
                    <span className="font-semibold">
                      {city.currency} ({city.currencySymbol})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">Language:</span>
                    <span className="font-semibold">{city.language}</span>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 mb-3">
                  <div className="text-sm text-gray-600 mb-1">Average Daily Cost</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {city.currencySymbol}{midRangeCost.toFixed(0)}
                  </div>
                  <div className="text-xs text-gray-500">Mid-range traveler</div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Updated {city.lastUpdated}</span>
                  <span className="text-blue-600 group-hover:text-blue-700 font-semibold">
                    View Details →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Coming Soon */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-gray-50 border border-gray-200 rounded-lg p-8">
            <h3 className="text-xl font-semibold mb-2">More Cities Coming Soon</h3>
            <p className="text-gray-600 mb-4">
              We're adding more cities with real travel cost data based on experience.
            </p>
            <p className="text-sm text-gray-500">
              Want to contribute data for your city?{' '}
              <Link href={`/${locale}/about`} className="text-blue-600 hover:underline">
                Learn how
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-2">{t('footer.tagline')}</p>
            <p className="text-sm text-gray-500">
              © 2026 {t('site.name')}. {t('footer.rights')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
