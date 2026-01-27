import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getCityById, getAllCities } from '@/data/cities';
import DailyCostCalculator from '@/components/calculators/DailyCostCalculator';
import TransportComparator from '@/components/calculators/TransportComparator';
import AirportTransferCalculator from '@/components/calculators/AirportTransferCalculator';
import Header from '@/components/Header';

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
      <Header
        locale={locale}
        activeSection="cities"
        translations={{
          home: t('nav.home'),
          cities: t('nav.cities'),
          about: t('nav.about')
        }}
      />

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
            {t('cities.lastUpdated')}: {city.lastUpdated}
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
            <h3 className="text-2xl font-bold text-gray-900 mb-6">💡 {t('cityDetails.tipping.title')}</h3>
            <div className="space-y-4">
              <div>
                <div className="font-semibold text-sm text-gray-500 mb-1">{t('cityDetails.tipping.restaurants')}</div>
                <div className="text-gray-900">{city.tips.restaurants}</div>
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-500 mb-1">{t('cityDetails.tipping.cafes')}</div>
                <div className="text-gray-900">{city.tips.cafes}</div>
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-500 mb-1">{t('cityDetails.tipping.taxis')}</div>
                <div className="text-gray-900">{city.tips.taxis}</div>
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-500 mb-1">{t('cityDetails.tipping.general')}</div>
                <div className="text-gray-900">{city.tips.general}</div>
              </div>
            </div>
          </div>

          {/* Cash vs Card */}
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">💳 {t('cityDetails.cash.title')}</h3>
            <div className="space-y-4">
              <div>
                <div className="font-semibold text-sm text-gray-500 mb-1">{t('cityDetails.cash.cardsAccepted')}</div>
                <div className="text-gray-900">{city.cash.widelyAccepted ? `✅ ${t('cityDetails.cash.yesWidely')}` : `⚠️ ${t('cityDetails.cash.limitedCash')}`}</div>
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-500 mb-1">{t('cityDetails.cash.atmAvailability')}</div>
                <div className="text-gray-900">{city.cash.atmAvailability}</div>
              </div>
              {city.cash.atmFees && (
                <div>
                  <div className="font-semibold text-sm text-gray-500 mb-1">{t('cityDetails.cash.atmFees')}</div>
                  <div className="text-gray-900">{city.cash.atmFees}</div>
                </div>
              )}
              <div>
                <div className="font-semibold text-sm text-gray-500 mb-1">{t('cityDetails.cash.recommended')}</div>
                <div className="text-gray-900">{city.cash.recommendedAmount}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Transport Details */}
        <section className="bg-white rounded-xl p-8 border border-gray-200 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">🚇 {t('cityDetails.transport.title')}</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {city.transport.metro && (
              <div>
                <div className="font-semibold text-gray-900 mb-3">{t('cityDetails.transport.metro')}</div>
                <ul className="text-sm space-y-2 text-gray-700">
                  <li>{t('cityDetails.transport.singleTicket')}: {city.currencySymbol}{city.transport.metro.singleTicket}</li>
                  {city.transport.metro.dayPass && (
                    <li>{t('cityDetails.transport.dayPass')}: {city.currencySymbol}{city.transport.metro.dayPass}</li>
                  )}
                  {city.transport.metro.multiTicket && (
                    <li>
                      {city.transport.metro.multiTicket.rides}-{t('cityDetails.transport.tripPack')}: {city.currencySymbol}
                      {city.transport.metro.multiTicket.price}
                    </li>
                  )}
                </ul>
              </div>
            )}

            {city.transport.bus && (
              <div>
                <div className="font-semibold text-gray-900 mb-3">{t('cityDetails.transport.bus')}</div>
                <ul className="text-sm space-y-2 text-gray-700">
                  <li>{t('cityDetails.transport.singleTicket')}: {city.currencySymbol}{city.transport.bus.singleTicket}</li>
                  {city.transport.bus.dayPass && (
                    <li>{t('cityDetails.transport.dayPass')}: {city.currencySymbol}{city.transport.bus.dayPass}</li>
                  )}
                </ul>
              </div>
            )}

            {city.transport.taxi && (
              <div>
                <div className="font-semibold text-gray-900 mb-3">{t('cityDetails.transport.taxi')}</div>
                <ul className="text-sm space-y-2 text-gray-700">
                  <li>{t('cityDetails.transport.baseRate')}: {city.currencySymbol}{city.transport.taxi.baseRate}</li>
                  <li>{t('cityDetails.transport.perKm')}: {city.currencySymbol}{city.transport.taxi.perKm}</li>
                  {city.transport.taxi.perMinute && (
                    <li>{t('cityDetails.transport.perMinute')}: {city.currencySymbol}{city.transport.taxi.perMinute}</li>
                  )}
                </ul>
              </div>
            )}

            {city.transport.uber?.available && (
              <div>
                <div className="font-semibold text-gray-900 mb-3">{t('cityDetails.transport.uber')}</div>
                <ul className="text-sm space-y-2 text-gray-700">
                  <li>✅ {t('cityDetails.transport.available')}</li>
                  {city.transport.uber.averageAirportToCity && (
                    <li>
                      {t('cityDetails.transport.airportToCity')}: ~{city.currencySymbol}
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
