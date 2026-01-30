import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import PublicTripView from '@/components/trips/PublicTripView';

interface PageProps {
  params: Promise<{
    shareToken: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shareToken } = await params;

  // Fetch trip data for metadata
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  try {
    const response = await fetch(`${baseUrl}/api/shared/${shareToken}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        title: 'Trip Not Found - TripCalc',
      };
    }

    const data = await response.json();
    const trip = data.trip;

    return {
      title: `${trip.name} - ${trip.cityName} | TripCalc`,
      description: `View this shared trip plan for ${trip.cityName}. ${trip.days} days, ${trip.tripStyle.toLowerCase().replace('_', '-')} budget.`,
    };
  } catch (error) {
    return {
      title: 'Shared Trip - TripCalc',
    };
  }
}

export default async function SharedTripPage({ params }: PageProps) {
  const { shareToken } = await params;
  const locale = await getLocale();

  // Fetch trip data
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  let trip;

  try {
    const response = await fetch(`${baseUrl}/api/shared/${shareToken}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      notFound();
    }

    const data = await response.json();
    trip = data.trip;
  } catch (error) {
    console.error('Error fetching shared trip:', error);
    notFound();
  }

  return <PublicTripView trip={trip} locale={locale} />;
}
