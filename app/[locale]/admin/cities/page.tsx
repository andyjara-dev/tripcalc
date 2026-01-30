/**
 * Admin: Cities List Page
 * Displays all cities (published and drafts) with management actions
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { isAdminUser } from '@/lib/auth-helpers';
import CityList from '@/components/admin/CityList';

export const metadata = {
  title: 'Manage Cities - Admin',
  description: 'Manage city data and content',
};

export default async function AdminCitiesPage() {
  const session = await auth();

  if (!session?.user || !(await isAdminUser(session))) {
    redirect('/');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage Cities</h1>
        <p className="text-gray-600">
          Add, edit, and manage city data for the trip calculator
        </p>
      </div>

      <CityList />
    </div>
  );
}
