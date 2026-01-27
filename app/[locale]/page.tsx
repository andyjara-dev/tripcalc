import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations();

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

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t('home.hero.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {t('home.hero.subtitle')}
          </p>
          <Link
            href={`/${locale}/cities`}
            className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            {t('home.hero.cta')}
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {['dailyCost', 'transport', 'airport', 'tips', 'cash', 'budget'].map((feature) => (
            <div key={feature} className="p-6 border rounded-lg hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">
                {t(`home.features.${feature}.title`)}
              </h3>
              <p className="text-gray-600">
                {t(`home.features.${feature}.description`)}
              </p>
            </div>
          ))}
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
