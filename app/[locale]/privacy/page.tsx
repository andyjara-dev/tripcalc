import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy' });

  return {
    title: `${t('title')} - TripCalc`,
    description: t('intro'),
  };
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tSite = await getTranslations({ locale, namespace: 'site' });

  const currentDate = new Date().toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        locale={locale}
        translations={{
          home: tNav('home'),
          cities: tNav('cities'),
          about: tNav('about'),
          logoAlt: tSite('name') + ' - ' + tSite('tagline')
        }}
      />

      {/* Content */}
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-600 mb-8">
            {t('lastUpdated', { date: currentDate })}
          </p>

          {/* Intro */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-8">
            <p className="text-gray-800">{t('intro')}</p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            {/* Section 1 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('section1.title')}</h2>
              <p className="text-gray-700 mb-3">{t('section1.p1')}</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>{t('section1.list.item1')}</li>
                <li>{t('section1.list.item2')}</li>
                <li>{t('section1.list.item3')}</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('section2.title')}</h2>
              <p className="text-gray-700 mb-3">{t('section2.p1')}</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>{t('section2.list.item1')}</li>
                <li>{t('section2.list.item2')}</li>
                <li>{t('section2.list.item3')}</li>
                <li>{t('section2.list.item4')}</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="mb-8 bg-green-50 border-l-4 border-green-600 p-6 rounded">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('section3.title')}</h2>
              <p className="text-gray-700 mb-3 font-semibold">{t('section3.p1')}</p>
              <p className="text-gray-700 mb-3">{t('section3.p2')}</p>
              <p className="text-gray-700">{t('section3.p3')}</p>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('section4.title')}</h2>
              <p className="text-gray-700 mb-3">{t('section4.p1')}</p>
              <p className="text-gray-700 mb-3">{t('section4.p2')}</p>
              <p className="text-gray-700">{t('section4.p3')}</p>
            </section>

            {/* Section 5 */}
            <section className="mb-8 bg-purple-50 border-l-4 border-purple-600 p-6 rounded">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('section5.title')}</h2>
              <p className="text-gray-700 mb-3">{t('section5.p1')}</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>{t('section5.list.item1')}</li>
                <li>{t('section5.list.item2')}</li>
                <li>{t('section5.list.item3')}</li>
                <li>{t('section5.list.item4')}</li>
                <li>{t('section5.list.item5')}</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('section6.title')}</h2>
              <p className="text-gray-700 mb-3">{t('section6.p1')}</p>
              <p className="text-gray-700 mb-3">{t('section6.p2')}</p>
              <p className="text-gray-700">{t('section6.p3')}</p>
            </section>

            {/* Section 7 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('section7.title')}</h2>
              <p className="text-gray-700 mb-3">{t('section7.p1')}</p>
              <p className="text-gray-700 mb-3">{t('section7.p2')}</p>
              <p className="text-gray-700">{t('section7.p3')}</p>
            </section>

            {/* Section 8 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('section8.title')}</h2>
              <p className="text-gray-700 mb-3">{t('section8.p1')}</p>
              <p className="text-gray-700">{t('section8.p2')}</p>
            </section>

            {/* Section 9 */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('section9.title')}</h2>
              <p className="text-gray-700 mb-3">{t('section9.p1')}</p>
              <p className="text-gray-700">{t('section9.p2')}</p>
            </section>

            {/* Section 10 */}
            <section className="mb-8 bg-green-50 border-l-4 border-green-600 p-6 rounded">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('section10.title')}</h2>
              <p className="text-gray-700 mb-3">{t('section10.p1')}</p>
              <p className="text-lg font-semibold text-blue-600">
                <a href="mailto:hello@tripcalc.site" className="hover:underline">
                  {t('section10.email')}
                </a>
              </p>
            </section>

            {/* Links */}
            <div className="mt-8 flex justify-center gap-6">
              <Link
                href={`/${locale}/terms`}
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                {t('title', { ns: 'terms' })}
              </Link>
              <Link
                href={`/${locale}`}
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                {tNav('home')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
