/**
 * Luggage Calculator - Premium Feature
 */

import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';
import LuggageCalculator from '@/components/calculators/luggage/LuggageCalculator';
import PremiumGate from '@/components/calculators/luggage/PremiumGate';

type Props = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'luggage' });

  return {
    title: `${t('title')} - TripCalc`,
    description: t('description'),
  };
}

export default async function LuggageCalculatorPage({ params }: Props) {
  const { locale } = await params;
  const session = await auth();

  // Check if user has premium access
  // @ts-ignore
  const hasPremium = session?.user?.isPremium || session?.user?.isAdmin;

  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tSite = await getTranslations({ locale, namespace: 'site' });
  const tLuggage = await getTranslations({ locale, namespace: 'luggage' });

  const headerTranslations = {
    home: tNav('home'),
    cities: tNav('cities'),
    calculators: tNav('calculators'),
    about: tNav('about'),
    logoAlt: tSite('name'),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header locale={locale} translations={headerTranslations} />

      <div className="pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              {tLuggage('title')}{' '}
              <span className="inline-block ml-2 text-sm bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full">
                👑 Premium
              </span>
            </h1>
            <p className="text-xl text-gray-900 max-w-2xl mx-auto">
              {tLuggage('description')}
            </p>
          </div>

          {/* Show premium gate or calculator */}
          {!hasPremium ? (
            <PremiumGate locale={locale} />
          ) : (
            <LuggageCalculator locale={locale} />
          )}
        </div>
      </div>
    </div>
  );
}
