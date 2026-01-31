import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';
import TripView from '@/components/trips/TripView';

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'trips' });

  return {
    title: `${t('tripDetails')} - TripCalc`,
  };
}

export default async function TripDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const trip = await prisma.trip.findUnique({
    where: {
      id,
      userId: session.user.id, // Ensure user owns this trip
    },
    include: {
      customItems: true,
    },
  });

  if (!trip) {
    notFound();
  }

  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tSite = await getTranslations({ locale, namespace: 'site' });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        locale={locale}
        activeSection="trips"
        translations={{
          home: tNav('home'),
          cities: tNav('cities'),
          calculators: tNav('calculators'),
          about: tNav('about'),
          logoAlt: tSite('name') + ' - ' + tSite('tagline')
        }}
      />

      {/* Main Content */}
      <div className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <TripView trip={trip} />
        </div>
      </div>
    </div>
  );
}
