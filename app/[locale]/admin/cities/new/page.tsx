/**
 * Admin: Create New City Page
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { isAdminUser } from '@/lib/auth-helpers';
import CityForm from '@/components/admin/CityForm';

export const metadata = {
  title: 'Add New City - Admin',
  description: 'Create a new city for the trip calculator',
};

export default async function NewCityPage() {
  const session = await auth();

  if (!session?.user || !(await isAdminUser(session))) {
    redirect('/');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Add New City</h1>
        <p className="text-gray-600">
          Create a new city destination for the trip calculator
        </p>
      </div>

      <CityForm mode="create" />
    </div>
  );
}
