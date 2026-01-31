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
          calculators: tNav('calculators'),
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
            <p className="text-gray-900">Update city information and settings</p>
          </div>

          {/* City Form */}
          <CityForm city={city} mode="edit" />

          {/* Additional data management links */}
          <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Data</h2>
            <p className="text-sm text-gray-900 mb-4">
              Manage detailed city data like costs, transport options, and tips.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-1">Daily Costs</h3>
                <p className="text-sm text-gray-900 mb-2">
                  {city.dailyCosts?.length || 0} travel styles configured
                </p>
                <a
                  href={`/admin/cities/${city.id}/costs`}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Manage Costs →
                </a>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-1">Transport Options</h3>
                <p className="text-sm text-gray-900 mb-2">
                  {city.transport?.length || 0} options available
                </p>
                <a
                  href={`/admin/cities/${city.id}/transport`}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Manage Transport →
                </a>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-1">Tips & Advice</h3>
                <p className="text-sm text-gray-900 mb-2">
                  {city.tips?.length || 0} tips configured
                </p>
                <a
                  href={`/admin/cities/${city.id}/tips`}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Manage Tips →
                </a>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-1">Cash Info</h3>
                <p className="text-sm text-gray-900 mb-2">
                  {city.cashInfo ? 'Configured' : 'Not configured'}
                </p>
                <a
                  href={`/admin/cities/${city.id}/cash-info`}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Manage Cash Info →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
