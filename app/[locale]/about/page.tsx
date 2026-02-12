import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Header from '@/components/Header';

export default async function AboutPage({
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
        activeSection="about"
        translations={{
          home: t('nav.home'),
          cities: t('nav.cities'),
          calculators: t('nav.calculators'),
          about: t('nav.about'),
          logoAlt: t('site.name') + ' - ' + t('site.tagline')
        }}
      />

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
                {t('about.realExperience.title')}
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                {t('about.realExperience.description')}
              </p>
              <ul className="space-y-3 text-gray-700">
                {['1', '2', '3', '4', '5'].map((i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-gray-400">•</span>
                    <span>{t(`about.realExperience.points.${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                {t('about.whatYouCanDo.title')}
              </h2>
              <ul className="space-y-3 text-gray-700">
                {['1', '2', '3', '4', '5', '6', '7', '8'].map((i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-gray-400">•</span>
                    <span>{t(`about.whatYouCanDo.points.${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-3xl font-semibold text-gray-900">
                  {t('about.premium.title')}
                </h2>
                <span className="px-3 py-1 text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full uppercase tracking-wide">
                  PRO
                </span>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                {t('about.premium.description')}
              </p>
              <ul className="space-y-3 text-gray-700">
                {['1', '2', '3'].map((i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-amber-500">•</span>
                    <span>{t(`about.premium.points.${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                {t('about.community.title')}
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                {t('about.community.description')}
              </p>
              <ul className="space-y-3 text-gray-700">
                {['1', '2', '3', '4'].map((i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-gray-400">•</span>
                    <span>{t(`about.community.points.${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-16 p-10 bg-gray-50 rounded-2xl border border-gray-200">
              <p className="text-2xl font-semibold text-center mb-3 text-gray-900">
                {t('footer.tagline')}
              </p>
              <p className="text-center text-gray-600 leading-relaxed">
                {t('about.finalMessage')}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
