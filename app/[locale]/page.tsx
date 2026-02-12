import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Header from '@/components/Header';
import HeroCarousel from '@/components/HeroCarousel';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <Header
        locale={locale}
        activeSection="home"
        translations={{
          home: t('nav.home'),
          cities: t('nav.cities'),
          calculators: t('nav.calculators'),
          about: t('nav.about'),
          logoAlt: t('site.name') + ' - ' + t('site.tagline')
        }}
      />

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="order-2 md:order-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {t('home.hero.title')}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                {t('home.hero.subtitle')}
              </p>
              <Link
                href={`/${locale}/cities`}
                className="inline-block bg-gray-900 text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
              >
                {t('home.hero.cta')}
              </Link>
            </div>

            {/* Hero Carousel */}
            <div className="order-1 md:order-2 relative">
              <HeroCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {([
              { key: 'dailyCost', href: `/${locale}/cities` },
              { key: 'transport', href: `/${locale}/cities` },
              { key: 'weather', href: `/${locale}/cities` },
              { key: 'itinerary', href: `/${locale}/cities` },
              { key: 'luggage', href: `/${locale}/calculators/luggage` },
              { key: 'expenses', href: `/${locale}/cities` },
            ] as const).map(({ key, href }) => {
              const isPro = t(`home.features.${key}.tag`) === 'PRO';
              return (
                <Link
                  key={key}
                  href={href}
                  className={`block p-8 rounded-xl hover:shadow-lg transition-all border ${
                    isPro
                      ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:border-amber-300'
                      : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {t(`home.features.${key}.title`)}
                    </h3>
                    {isPro ? (
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full uppercase tracking-wide">
                        PRO
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {t(`home.features.${key}.tag`)}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {t(`home.features.${key}.description`)}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
