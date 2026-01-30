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
            {['dailyCost', 'transport', 'airport', 'tips', 'cash', 'budget'].map((feature) => (
              <div
                key={feature}
                className="p-8 bg-gray-50 rounded-xl hover:shadow-lg transition-all border border-gray-100"
              >
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  {t(`home.features.${feature}.title`)}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t(`home.features.${feature}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
