/**
 * Admin: Manage City Tips & Advice
 */

import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import TipsManager from '@/components/admin/TipsManager';

type Props = {
  params: Promise<{
    cityId: string;
    locale: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, cityId } = await params;
  const city = await prisma.city.findUnique({
    where: { id: cityId },
    select: { name: true },
  });

  return {
    title: `Tips & Advice - ${city?.name || 'City'} - Admin | TripCalc`,
  };
}

export default async function ManageTipsPage({ params }: Props) {
  const { locale, cityId } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // @ts-ignore
  if (!session.user.isAdmin) {
    redirect('/');
  }

  const city = await prisma.city.findUnique({
    where: { id: cityId },
    include: {
      tips: {
        orderBy: [{ category: 'asc' }, { order: 'asc' }],
      },
    },
  });

  if (!city) {
    notFound();
  }

  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tSite = await getTranslations({ locale, namespace: 'site' });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        locale={locale}
        activeSection="cities"
        translations={{
          home: tNav('home'),
          cities: tNav('cities'),
          about: tNav('about'),
          logoAlt: tSite('name') + ' - ' + tSite('tagline')
        }}
      />

      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-900 mb-4">
              <Link href="/admin/cities" className="hover:text-blue-600">Cities</Link>
              <span>/</span>
              <Link href={`/admin/cities/${city.id}`} className="hover:text-blue-600">{city.name}</Link>
              <span>/</span>
              <span className="font-medium">Tips & Advice</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              💡 Tips & Advice - {city.name}
            </h1>
            <p className="text-gray-900">
              Add helpful tips for travelers about payment, safety, culture, language, etc.
            </p>
          </div>

          {/* Tips Manager Component */}
          <TipsManager city={city} />
        </div>
      </div>
    </div>
  );
}
