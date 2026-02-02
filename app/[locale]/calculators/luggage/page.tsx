/**
 * Luggage Calculator - Premium Feature
 */

import { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';
import LuggageCalculator from '@/components/calculators/luggage/LuggageCalculator';
import PremiumGate from '@/components/calculators/luggage/PremiumGate';

type Props = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    loadId?: string;
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

export default async function LuggageCalculatorPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { loadId } = await searchParams;
  const session = await auth();

  // Check if user has premium access
  // @ts-ignore
  const hasPremium = session?.user?.isPremium || session?.user?.isAdmin;

  // Load existing packing list if loadId is provided
  let savedPackingList = null;
  if (loadId && session?.user?.id) {
    savedPackingList = await prisma.packingList.findUnique({
      where: {
        id: loadId,
        userId: session.user.id, // Ensure user owns this list
      },
    });
  }

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
      <Header locale={locale} activeSection="calculators" translations={headerTranslations} />

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
            <LuggageCalculator
              locale={locale}
              editingListId={loadId}
              initialData={savedPackingList ? {
                name: savedPackingList.name || undefined,
                preset: savedPackingList.preset || undefined,
                airlineId: savedPackingList.airlineId || undefined,
                luggageType: savedPackingList.luggageType as any,
                weightLimit: savedPackingList.weightLimit,
                dimensions: savedPackingList.dimensions || undefined,
                duration: savedPackingList.duration,
                tripType: savedPackingList.tripType as any,
                climate: (savedPackingList.climate as any) || undefined,
                gender: savedPackingList.gender as any,
                destination: savedPackingList.destination || undefined,
                startDate: savedPackingList.startDate || undefined,
                endDate: savedPackingList.endDate || undefined,
                items: savedPackingList.items as any[],
                tips: savedPackingList.tips as string[],
                warnings: (savedPackingList.warnings as string[]) || [],
                totalWeight: savedPackingList.totalWeight,
              } : undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}
