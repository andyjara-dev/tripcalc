import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Header from '@/components/Header';

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
          about: t('nav.about')
        }}
      />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t('home.hero.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('home.hero.subtitle')}
          </p>
          <Link
            href={`/${locale}/cities`}
            className="inline-block bg-gray-900 text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
          >
            {t('home.hero.cta')}
          </Link>
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
