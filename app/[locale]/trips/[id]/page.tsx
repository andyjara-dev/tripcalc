import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getTranslations } from 'next-intl/server';
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
  const { id } = await params;
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

  return <TripView trip={trip} />;
}
