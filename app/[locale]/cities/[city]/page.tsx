import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getCity, getAllCities } from '@/lib/cities/service';
import CalculatorTabs from '@/components/CalculatorTabs';
import Header from '@/components/Header';
import Breadcrumbs from '@/components/Breadcrumbs';
import CollapsibleCard from '@/components/CollapsibleCard';

interface CityPageProps {
  params: Promise<{
    city: string;
    locale: string;
  }>;
}

// Generate static params for all cities
export async function generateStaticParams() {
  const cities = await getAllCities();
  return cities.map((city) => ({
    city: city.id,
  }));
}

export async function generateMetadata({ params }: CityPageProps) {
  const { city: cityId, locale } = await params;
  const city = await getCity(cityId);
  const t = await getTranslations({ locale, namespace: 'cities' });

  if (!city) {
    return {
      title: t('notFound.title'),
      description: t('notFound.description'),
    };
  }

  return {
    title: t('metadata.title', { city: city.name }),
    description: t('metadata.description', { city: city.name, country: city.country }),
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const { city: cityId, locale } = await params;
  const t = await getTranslations({ locale });
  const city = await getCity(cityId);

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
          calculators: t('nav.calculators'),
          about: t('nav.about'),
          logoAlt: t('site.name') + ' - ' + t('site.tagline')
        }}
      />

      {/* City Header */}
      <section className="pt-32 pb-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <Breadcrumbs
            locale={locale}
            items={[
              { label: t('nav.home'), href: `/${locale}` },
              { label: t('nav.cities'), href: `/${locale}/cities` },
              { label: city.name }
            ]}
          />
          <h1 className="text-5xl font-bold text-gray-900 mb-6">{city.name}</h1>
          <div className="flex flex-wrap gap-6 text-lg text-gray-600">
            <span className="flex items-center gap-2">📍 {city.country}</span>
            <span className="flex items-center gap-2">💰 {city.currency} ({city.currencySymbol})</span>
            <span className="flex items-center gap-2">🗣️ {city.language}</span>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-blue-600" title={t('cities.lastUpdatedTooltip')}>
              📅
            </span>
            <span className="text-sm text-blue-800 font-medium">
              {t('cities.lastUpdated')}: {city.lastUpdated}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Calculator Tabs */}
        <section className="mb-16">
          <CalculatorTabs city={city} />
        </section>

        {/* Disclaimer */}
        <div className="mb-12 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <span className="text-amber-600 text-xl flex-shrink-0">ℹ️</span>
            <div>
              <h4 className="text-sm font-semibold text-amber-900 mb-1">
                {t('cities.disclaimer.title')}
              </h4>
              <p className="text-sm text-amber-800">
                {t('cities.disclaimer.message')}
              </p>
            </div>
          </div>
        </div>

        {/* Hidden Costs Alerts */}
        {city.hiddenCosts && city.hiddenCosts.length > 0 && (
          <div className="mb-12 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              ⚠️ {t('cities.hiddenCosts.title')}
            </h3>
            {city.hiddenCosts.map((cost, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  cost.type === 'tax' ? 'border-red-500 bg-red-50' :
                  cost.type === 'fee' ? 'border-orange-500 bg-orange-50' :
                  cost.type === 'surcharge' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{cost.title}</h4>
                    <p className="text-sm text-gray-700">{cost.description}</p>
                  </div>
                  {cost.amount && (
                    <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                      {cost.amount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tips & Info */}
        <section className="grid md:grid-cols-2 gap-6 mb-16">
          {/* Tipping Culture */}
          <CollapsibleCard title={t('cityDetails.tipping.title')} icon="💡" defaultOpen={true}>
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
          </CollapsibleCard>

          {/* Cash vs Card */}
          <CollapsibleCard title={t('cityDetails.cash.title')} icon="💳" defaultOpen={true}>
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
          </CollapsibleCard>
        </section>

        {/* Transport Details */}
        <section className="mb-16">
          <CollapsibleCard title={t('cityDetails.transport.title')} icon="🚇" defaultOpen={false}>
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
          </CollapsibleCard>
        </section>
      </div>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4">{t('footer.cta.title')}</h3>
          <p className="text-gray-400 text-lg mb-6 max-w-2xl mx-auto">
            {t('footer.cta.subtitle')}
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Link
              href={`/${locale}/cities`}
              className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              {t('footer.cta.exploreCities')}
            </Link>
            <Link
              href={`/${locale}/about`}
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-colors"
            >
              {t('footer.cta.learnMore')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
