import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function AboutPage({
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
              <Link href={`/${locale}/about`} className="hover:text-gray-600 font-semibold">
                {t('nav.about')}
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold mb-8">{t('about.title')}</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 mb-8">
            {t('about.mission')}
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">
            {t('about.difference.title')}
          </h2>
          <p className="text-gray-700 mb-6">
            {t('about.difference.description')}
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">
            Built from Real Experience
          </h2>
          <p className="text-gray-700 mb-4">
            TripCalc is not a generic travel blog. It's built using:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
            <li>First-hand travel experience</li>
            <li>Local knowledge from residents</li>
            <li>Real-world testing of transport, ATMs, SIMs, and daily expenses</li>
            <li>Data collected and refined over time</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">
            What You Can Do with TripCalc
          </h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
            <li>Estimate the real daily cost of a trip</li>
            <li>Compare transportation options with real prices</li>
            <li>Calculate airport-to-city transfers</li>
            <li>Understand tips, fees, and hidden costs</li>
            <li>Plan cash vs card usage</li>
            <li>Make smarter budgeting decisions before and during a trip</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">
            Growing with the Community
          </h2>
          <p className="text-gray-700 mb-4">
            TripCalc is designed to grow gradually:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
            <li>Starting with a few cities and core calculators</li>
            <li>Expanding with better data over time</li>
            <li>Eventually incorporating community-submitted insights</li>
            <li>Always prioritizing accuracy over hype</li>
          </ul>

          <div className="mt-12 p-8 bg-gray-50 rounded-lg">
            <p className="text-xl font-semibold text-center mb-2">
              {t('footer.tagline')}
            </p>
            <p className="text-center text-gray-600">
              TripCalc helps you plan with confidence by turning travel into numbers you can actually use.
            </p>
          </div>
        </div>
      </main>

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
