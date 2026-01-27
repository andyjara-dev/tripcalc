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
              <Link href={`/${locale}/cities`} className="hover:text-gray-600">
                {t('nav.cities')}
              </Link>
              <Link href={`/${locale}/about`} className="hover:text-gray-600">
                {t('nav.about')}
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* City Header */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{city.name}</h1>
          <div className="flex flex-wrap gap-4 text-lg">
            <span>📍 {city.country}</span>
            <span>💰 {city.currency} ({city.currencySymbol})</span>
            <span>🗣️ {city.language}</span>
          </div>
          <div className="mt-4 text-sm text-blue-100">
            Last updated: {city.lastUpdated}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
        <section className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Tipping Culture */}
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-4">💡 Tipping Culture</h3>
            <div className="space-y-3">
              <div>
                <div className="font-semibold text-sm text-gray-600">Restaurants</div>
                <div>{city.tips.restaurants}</div>
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-600">Cafes</div>
                <div>{city.tips.cafes}</div>
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-600">Taxis</div>
                <div>{city.tips.taxis}</div>
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-600">General</div>
                <div>{city.tips.general}</div>
              </div>
            </div>
          </div>

          {/* Cash vs Card */}
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-4">💳 Cash & Cards</h3>
            <div className="space-y-3">
              <div>
                <div className="font-semibold text-sm text-gray-600">Cards Accepted?</div>
                <div>{city.cash.widelyAccepted ? '✅ Yes, widely' : '⚠️ Limited, carry cash'}</div>
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-600">ATM Availability</div>
                <div>{city.cash.atmAvailability}</div>
              </div>
              {city.cash.atmFees && (
                <div>
                  <div className="font-semibold text-sm text-gray-600">ATM Fees</div>
                  <div>{city.cash.atmFees}</div>
                </div>
              )}
              <div>
                <div className="font-semibold text-sm text-gray-600">Recommended Amount</div>
                <div>{city.cash.recommendedAmount}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Transport Details */}
        <section className="bg-white border rounded-lg p-6 shadow-sm mb-12">
          <h3 className="text-xl font-bold mb-4">🚇 Transport Details</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {city.transport.metro && (
              <div>
                <div className="font-semibold mb-2">Metro/Subway</div>
                <ul className="text-sm space-y-1 text-gray-700">
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
                <div className="font-semibold mb-2">Bus</div>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>Single ticket: {city.currencySymbol}{city.transport.bus.singleTicket}</li>
                  {city.transport.bus.dayPass && (
                    <li>Day pass: {city.currencySymbol}{city.transport.bus.dayPass}</li>
                  )}
                </ul>
              </div>
            )}

            {city.transport.taxi && (
              <div>
                <div className="font-semibold mb-2">Taxi</div>
                <ul className="text-sm space-y-1 text-gray-700">
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
                <div className="font-semibold mb-2">Uber/Rideshare</div>
                <ul className="text-sm space-y-1 text-gray-700">
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
