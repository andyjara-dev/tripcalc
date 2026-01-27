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
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={`/${locale}`} className="text-xl font-bold text-gray-900">
            {t('site.name')}
          </Link>
          <div className="flex gap-8">
            <Link href={`/${locale}`} className="text-gray-600 hover:text-gray-900 transition">
              {t('nav.home')}
            </Link>
            <Link href={`/${locale}/cities`} className="text-gray-900 font-semibold">
              {t('nav.cities')}
            </Link>
            <Link href={`/${locale}/about`} className="text-gray-600 hover:text-gray-900 transition">
              {t('nav.about')}
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Cities</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real travel costs, transport prices, and practical tips for cities around the world
          </p>
        </div>
      </section>

      {/* Cities Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
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
                  className="block bg-white rounded-xl p-6 hover:shadow-xl transition-all border border-gray-100 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition">
                        {city.name}
                      </h3>
                      <div className="text-gray-500">{city.country}</div>
                    </div>
                    <div className="text-2xl">🏙️</div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Currency:</span>
                      <span className="font-medium text-gray-900">
                        {city.currency} ({city.currencySymbol})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Language:</span>
                      <span className="font-medium text-gray-900">{city.language}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="text-sm text-gray-500 mb-1">Average Daily Cost</div>
                    <div className="text-3xl font-bold text-gray-900">
                      {city.currencySymbol}{midRangeCost.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Mid-range traveler</div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Updated {city.lastUpdated}</span>
                    <span className="text-gray-900 font-semibold group-hover:underline">
                      View Details →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Coming Soon */}
          <div className="mt-16 text-center">
            <div className="inline-block bg-white border border-gray-200 rounded-xl p-10 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">More Cities Coming Soon</h3>
              <p className="text-gray-600 mb-4 max-w-md">
                We're adding more cities with real travel cost data based on experience.
              </p>
              <p className="text-sm text-gray-500">
                Want to contribute data for your city?{' '}
                <Link href={`/${locale}/about`} className="text-gray-900 hover:underline font-medium">
                  Learn how
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6 mt-20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400 mb-2">{t('footer.tagline')}</p>
          <p className="text-sm text-gray-500">
            © 2026 {t('site.name')}. {t('footer.rights')}
          </p>
        </div>
      </footer>
    </div>
  );
}
