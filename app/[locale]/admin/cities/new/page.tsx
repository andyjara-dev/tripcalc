/**
 * Admin: Create New City Page
 */

import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';
import CityForm from '@/components/admin/CityForm';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin' });

  return {
    title: `Add New City - Admin | TripCalc`,
  };
}

export default async function NewCityPage({ params }: PageProps) {
  const { locale } = await params;
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
              ➕ Add New City
            </h1>
            <p className="text-gray-600">
              Create a new city destination for the trip calculator
            </p>
          </div>

          {/* City Form */}
          <CityForm mode="create" />
        </div>
      </div>
    </div>
  );
}
