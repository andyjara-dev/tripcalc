import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Header from '@/components/Header';
import TripCard from '@/components/trips/TripCard';
import SharedTripCard from '@/components/trips/SharedTripCard';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'trips' });

  return {
    title: `${t('title')} - TripCalc`,
    description: t('noTripsMessage'),
  };
}

export default async function TripsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const [trips, sharedTrips] = await Promise.all([
    prisma.trip.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { customItems: true } },
      },
    }),
    prisma.sharedTrip.findMany({
      where: { sharedWithId: session.user.id },
      include: {
        trip: {
          select: {
            id: true,
            name: true,
            cityId: true,
            cityName: true,
            startDate: true,
            endDate: true,
            days: true,
            tripStyle: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        sharedBy: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const t = await getTranslations({ locale, namespace: 'trips' });
  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tSite = await getTranslations({ locale, namespace: 'site' });

  // Serialize dates for client components
  const serializedSharedTrips = sharedTrips.map((st) => ({
    id: st.id,
    trip: {
      ...st.trip,
      startDate: st.trip.startDate?.toISOString() ?? null,
      endDate: st.trip.endDate?.toISOString() ?? null,
      createdAt: st.trip.createdAt.toISOString(),
      updatedAt: st.trip.updatedAt.toISOString(),
    },
    sharedBy: st.sharedBy,
    createdAt: st.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
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

      <div className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('title')}</h1>
            <p className="text-gray-600">
              {t('noTripsMessage').split('.')[0] + '.'}
            </p>
          </div>

          {/* My Trips Grid */}
          {trips.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">✈️</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {t('noTrips')}
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {t('noTripsMessage')}
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('browseCities')}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}

          {/* Shared with me section */}
          {serializedSharedTrips.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('sharedWithMe')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {serializedSharedTrips.map((st) => (
                  <SharedTripCard key={st.id} sharedTrip={st} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
