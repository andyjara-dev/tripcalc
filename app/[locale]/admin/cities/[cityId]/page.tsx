/**
 * Admin: Edit City Page
 */

import { redirect, notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { isAdminUser } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import CityForm from '@/components/admin/CityForm';

export const metadata = {
  title: 'Edit City - Admin',
  description: 'Edit city data',
};

type Props = {
  params: Promise<{
    cityId: string;
    locale: string;
  }>;
};

export default async function EditCityPage({ params }: Props) {
  const session = await auth();

  if (!session?.user || !(await isAdminUser(session))) {
    redirect('/');
  }

  const { cityId } = await params;

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit City: {city.name}</h1>
        <p className="text-gray-600">Update city information and settings</p>
      </div>

      <CityForm city={city} mode="edit" />

      {/* Additional data management links */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Additional Data</h2>
        <p className="text-sm text-gray-600 mb-4">
          Manage detailed city data like costs, transport options, and tips.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-white border border-gray-200 rounded p-4">
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

          <div className="bg-white border border-gray-200 rounded p-4">
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

          <div className="bg-white border border-gray-200 rounded p-4">
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

          <div className="bg-white border border-gray-200 rounded p-4">
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
  );
}
