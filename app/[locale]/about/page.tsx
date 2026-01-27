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
            <Link href={`/${locale}/cities`} className="text-gray-600 hover:text-gray-900 transition">
              {t('nav.cities')}
            </Link>
            <Link href={`/${locale}/about`} className="text-gray-900 font-semibold">
              {t('nav.about')}
            </Link>
          </div>
        </nav>
      </header>

      {/* Content */}
      <main className="pt-32 pb-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-8">{t('about.title')}</h1>

          <div className="space-y-12">
            <p className="text-xl text-gray-600 leading-relaxed">
              {t('about.mission')}
            </p>

            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                {t('about.difference.title')}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t('about.difference.description')}
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                Built from Real Experience
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                TripCalc is not a generic travel blog. It's built using:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-gray-400">•</span>
                  <span>First-hand travel experience</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gray-400">•</span>
                  <span>Local knowledge from residents</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gray-400">•</span>
                  <span>Real-world testing of transport, ATMs, SIMs, and daily expenses</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gray-400">•</span>
                  <span>Data collected and refined over time</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                What You Can Do with TripCalc
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-gray-400">•</span>
                  <span>Estimate the real daily cost of a trip</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gray-400">•</span>
                  <span>Compare transportation options with real prices</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gray-400">•</span>
                  <span>Calculate airport-to-city transfers</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gray-400">•</span>
                  <span>Understand tips, fees, and hidden costs</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gray-400">•</span>
                  <span>Plan cash vs card usage</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gray-400">•</span>
                  <span>Make smarter budgeting decisions before and during a trip</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                Growing with the Community
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                TripCalc is designed to grow gradually:
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-gray-400">•</span>
                  <span>Starting with a few cities and core calculators</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gray-400">•</span>
                  <span>Expanding with better data over time</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gray-400">•</span>
                  <span>Eventually incorporating community-submitted insights</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gray-400">•</span>
                  <span>Always prioritizing accuracy over hype</span>
                </li>
              </ul>
            </div>

            <div className="mt-16 p-10 bg-gray-50 rounded-2xl border border-gray-200">
              <p className="text-2xl font-semibold text-center mb-3 text-gray-900">
                {t('footer.tagline')}
              </p>
              <p className="text-center text-gray-600 leading-relaxed">
                TripCalc helps you plan with confidence by turning travel into numbers you can actually use.
              </p>
            </div>
          </div>
        </div>
      </main>

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
