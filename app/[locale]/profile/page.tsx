import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';
import ProfileView from '@/components/profile/ProfileView';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'profile' });

  return {
    title: `${t('title')} - TripCalc`,
    description: t('accountSettings'),
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/auth/signin`);
  }

  // Get translations for Header
  const tNav = await getTranslations({ locale, namespace: 'nav' });
  const tAuth = await getTranslations({ locale, namespace: 'auth' });
  const tProfile = await getTranslations({ locale, namespace: 'profile' });
  const tSite = await getTranslations({ locale, namespace: 'site' });

  const headerTranslations = {
    home: tNav('home'),
    cities: tNav('cities'),
    calculators: tNav('calculators'),
    about: tNav('about'),
    logoAlt: tSite('name'),
    signIn: tAuth('signIn'),
    signOut: tAuth('signOut'),
    profile: tProfile('title'),
    myTrips: tAuth('myTrips'),
    adminDashboard: tAuth('adminDashboard'),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        locale={locale}
        translations={headerTranslations}
      />

      <main className="container mx-auto px-4 py-8">
        <ProfileView session={session} />
      </main>
    </div>
  );
}
