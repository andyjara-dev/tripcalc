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
            {/* Origin Story */}
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                {t('about.origin.title')}
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>{t('about.origin.p1')}</p>
                <p>{t('about.origin.p2')}</p>
                <p>{t('about.origin.p3')}</p>
              </div>
            </div>

            {/* Why TripCalc */}
            <div className="p-8 bg-blue-50 rounded-2xl border border-blue-200">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                {t('about.why.title')}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {t('about.why.description')}
              </p>
            </div>

            {/* What You Can Do */}
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                {t('about.whatYouCanDo.title')}
              </h2>
              <ul className="space-y-3 text-gray-700">
                {['1', '2', '3', '4', '5', '6', '7', '8'].map((i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-blue-500 flex-shrink-0">&#10003;</span>
                    <span>{t(`about.whatYouCanDo.points.${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Premium */}
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
              <ul className="space-y-3 text-gray-700 mb-6">
                {['1', '2', '3'].map((i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-amber-500">&#10003;</span>
                    <span>{t(`about.premium.points.${i}`)}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/${locale}/premium`}
                className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:shadow-md transition transform hover:scale-[1.02]"
              >
                {t('about.premium.points.3')}
              </Link>
            </div>

            {/* What's Next */}
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                {t('about.future.title')}
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                {t('about.future.description')}
              </p>
              <ul className="space-y-3 text-gray-700">
                {['1', '2', '3', '4'].map((i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-gray-400">&#8226;</span>
                    <span>{t(`about.future.points.${i}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-200">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">
                {t('about.contact.title')}
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  {t('about.contact.p1')}{' '}
                  <a href="mailto:contact@tripcalc.site" className="text-blue-600 hover:underline font-medium">
                    contact@tripcalc.site
                  </a>
                </p>
                <p>{t('about.contact.p2')}</p>
                <p className="text-gray-600 text-sm">{t('about.contact.p3')}</p>
              </div>
            </div>

            {/* Final Message */}
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
