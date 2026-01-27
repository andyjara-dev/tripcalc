import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { getCityById, getAllCities } from '@/data/cities';
import DailyCostCalculator from '@/components/calculators/DailyCostCalculator';
import TransportComparator from '@/components/calculators/TransportComparator';
import AirportTransferCalculator from '@/components/calculators/AirportTransferCalculator';

interface CityPageProps {
  params: Promise<{
    city: string;
    locale: string;
  }>;
}

// Generate static params for all cities
export async function generateStaticParams() {
  const cities = getAllCities();
  return cities.map((city) => ({
    city: city.id,
  }));
}

export async function generateMetadata({ params }: CityPageProps) {
  const { city: cityId } = await params;
  const city = getCityById(cityId);

  if (!city) {
    return {
      title: 'City Not Found',
    };
  }

  return {
    title: `${city.name} Travel Costs - TripCalc`,
    description: `Calculate real travel costs for ${city.name}, ${city.country}. Daily budgets, transport prices, and practical tips based on experience.`,
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const { city: cityId, locale } = await params;
  const t = await getTranslations();
  const city = getCityById(cityId);

  if (!city) {
    notFound();
  }

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

      {/* City Header */}
      <section className="pt-32 pb-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">{city.name}</h1>
          <div className="flex flex-wrap gap-6 text-lg text-gray-600">
            <span className="flex items-center gap-2">📍 {city.country}</span>
            <span className="flex items-center gap-2">💰 {city.currency} ({city.currencySymbol})</span>
            <span className="flex items-center gap-2">🗣️ {city.language}</span>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Last updated: {city.lastUpdated}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Daily Cost Calculator */}
        <section className="mb-12">
          <DailyCostCalculator city={city} />
        </section>

        {/* Transport Comparator */}
        <section className="mb-12">
          <TransportComparator city={city} />
        </section>

        {/* Airport Transfer Calculator */}
        <section className="mb-12">
          <AirportTransferCalculator city={city} />
        </section>

        {/* Tips & Info */}
        <section className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Tipping Culture */}
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">💡 Tipping Culture</h3>
            <div className="space-y-4">
              <div>
                <div className="font-semibold text-sm text-gray-500 mb-1">Restaurants</div>
                <div className="text-gray-900">{city.tips.restaurants}</div>
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-500 mb-1">Cafes</div>
                <div className="text-gray-900">{city.tips.cafes}</div>
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-500 mb-1">Taxis</div>
                <div className="text-gray-900">{city.tips.taxis}</div>
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-500 mb-1">General</div>
                <div className="text-gray-900">{city.tips.general}</div>
              </div>
            </div>
          </div>

          {/* Cash vs Card */}
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">💳 Cash & Cards</h3>
            <div className="space-y-4">
              <div>
                <div className="font-semibold text-sm text-gray-500 mb-1">Cards Accepted?</div>
                <div className="text-gray-900">{city.cash.widelyAccepted ? '✅ Yes, widely' : '⚠️ Limited, carry cash'}</div>
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-500 mb-1">ATM Availability</div>
                <div className="text-gray-900">{city.cash.atmAvailability}</div>
              </div>
              {city.cash.atmFees && (
                <div>
                  <div className="font-semibold text-sm text-gray-500 mb-1">ATM Fees</div>
                  <div className="text-gray-900">{city.cash.atmFees}</div>
                </div>
              )}
              <div>
                <div className="font-semibold text-sm text-gray-500 mb-1">Recommended Amount</div>
                <div className="text-gray-900">{city.cash.recommendedAmount}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Transport Details */}
        <section className="bg-white rounded-xl p-8 border border-gray-200 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">🚇 Transport Details</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {city.transport.metro && (
              <div>
                <div className="font-semibold text-gray-900 mb-3">Metro/Subway</div>
                <ul className="text-sm space-y-2 text-gray-700">
                  <li>Single ticket: {city.currencySymbol}{city.transport.metro.singleTicket}</li>
                  {city.transport.metro.dayPass && (
                    <li>Day pass: {city.currencySymbol}{city.transport.metro.dayPass}</li>
                  )}
                  {city.transport.metro.multiTicket && (
                    <li>
                      {city.transport.metro.multiTicket.rides}-trip pack: {city.currencySymbol}
                      {city.transport.metro.multiTicket.price}
                    </li>
                  )}
                </ul>
              </div>
            )}

            {city.transport.bus && (
              <div>
                <div className="font-semibold text-gray-900 mb-3">Bus</div>
                <ul className="text-sm space-y-2 text-gray-700">
                  <li>Single ticket: {city.currencySymbol}{city.transport.bus.singleTicket}</li>
                  {city.transport.bus.dayPass && (
                    <li>Day pass: {city.currencySymbol}{city.transport.bus.dayPass}</li>
                  )}
                </ul>
              </div>
            )}

            {city.transport.taxi && (
              <div>
                <div className="font-semibold text-gray-900 mb-3">Taxi</div>
                <ul className="text-sm space-y-2 text-gray-700">
                  <li>Base rate: {city.currencySymbol}{city.transport.taxi.baseRate}</li>
                  <li>Per km: {city.currencySymbol}{city.transport.taxi.perKm}</li>
                  {city.transport.taxi.perMinute && (
                    <li>Per minute: {city.currencySymbol}{city.transport.taxi.perMinute}</li>
                  )}
                </ul>
              </div>
            )}

            {city.transport.uber?.available && (
              <div>
                <div className="font-semibold text-gray-900 mb-3">Uber/Rideshare</div>
                <ul className="text-sm space-y-2 text-gray-700">
                  <li>✅ Available</li>
                  {city.transport.uber.averageAirportToCity && (
                    <li>
                      Airport to city: ~{city.currencySymbol}
                      {city.transport.uber.averageAirportToCity}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
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
