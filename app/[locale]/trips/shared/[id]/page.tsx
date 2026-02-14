import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import PublicTripView from '@/components/trips/PublicTripView';
import SharedTripCopyButton from './SharedTripCopyButton';

interface PageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  const trip = await prisma.trip.findUnique({
    where: { id },
    select: { name: true, cityName: true, days: true, tripStyle: true },
  });

  if (!trip) {
    return { title: 'Trip Not Found - TripCalc' };
  }

  return {
    title: `${trip.name} - ${trip.cityName} | TripCalc`,
    description: `Shared trip plan for ${trip.cityName}. ${trip.days} days, ${trip.tripStyle.toLowerCase().replace('_', '-')} budget.`,
  };
}

export default async function SharedTripViewPage({ params }: PageProps) {
  const { locale, id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Check the user has a SharedTrip record for this trip
  const sharedRecord = await prisma.sharedTrip.findUnique({
    where: {
      tripId_sharedWithId: {
        tripId: id,
        sharedWithId: session.user.id,
      },
    },
  });

  if (!sharedRecord) {
    notFound();
  }

  // Fetch the trip with expenses
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      expenses: {
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!trip) {
    notFound();
  }

  const tripData = {
    ...trip,
    expenses: trip.expenses.map((e) => ({
      ...e,
      amount: e.amount / 100,
      notes: e.notes ?? undefined,
      customItemId: e.customItemId ?? undefined,
    })),
  };

  return (
    <div>
      <SharedTripCopyButton tripId={trip.id} locale={locale} />
      <PublicTripView trip={tripData} locale={locale} />
    </div>
  );
}
