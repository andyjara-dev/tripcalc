/**
 * Admin: Edit City Page
 */

import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';
import { prisma } from '@/lib/db';
import CityForm from '@/components/admin/CityForm';

type Props = {
  params: Promise<{
    cityId: string;
    locale: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, cityId } = await params;
  const t = await getTranslations({ locale, namespace: 'admin' });

  const city = await prisma.city.findUnique({
    where: { id: cityId },
    select: { name: true },
  });

  return {
    title: `${city?.name || 'Edit City'} - Admin | TripCalc`,
  };
}

export default async function EditCityPage({ params }: Props) {
  const { locale, cityId } = await params;
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Check if user is admin
  // @ts-ignore
  if (!session.user.isAdmin) {
    redirect('/');
  }

  // Fetch city data
  const city = await prisma.city.findUnique({
    where: { id: cityId },
    include: {
      dailyCosts: true,
      transport: true,
      airports: true,
      tips: true,
      cashInfo: true,
    },
  });

  if (!city) {
    notFound();
  }

  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tSite = await getTranslations({ locale, namespace: 'site' });
  const tAdmin = await getTranslations({ locale, namespace: 'admin' });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

      {/* Main Content */}
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ✏️ Edit City: {city.name}
            </h1>
            <p className="text-gray-600">Update city information and settings</p>
          </div>

          {/* City Form */}
          <CityForm city={city} mode="edit" />

          {/* Additional data management links */}
          <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Additional Data</h2>
            <p className="text-sm text-gray-600 mb-4">
              Manage detailed city data like costs, transport options, and tips.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium mb-1">Daily Costs</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {city.dailyCosts?.length || 0} travel styles configured
                </p>
                <button
                  disabled
                  className="text-sm text-gray-400 cursor-not-allowed"
                >
                  Manage Costs (coming soon)
                </button>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium mb-1">Transport Options</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {city.transport?.length || 0} options available
                </p>
                <button
                  disabled
                  className="text-sm text-gray-400 cursor-not-allowed"
                >
                  Manage Transport (coming soon)
                </button>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium mb-1">Tips & Advice</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {city.tips?.length || 0} tips configured
                </p>
                <button
                  disabled
                  className="text-sm text-gray-400 cursor-not-allowed"
                >
                  Manage Tips (coming soon)
                </button>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium mb-1">Cash Info</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {city.cashInfo ? 'Configured' : 'Not configured'}
                </p>
                <button
                  disabled
                  className="text-sm text-gray-400 cursor-not-allowed"
                >
                  Manage Cash Info (coming soon)
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Note: For now, you can manage detailed data using Prisma Studio or directly in the database.
              Future updates will add full UI for managing these relations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
