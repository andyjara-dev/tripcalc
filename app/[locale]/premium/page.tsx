import { auth } from '@/lib/auth';
import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';
import PremiumPageContent from '@/components/premium/PremiumPageContent';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'premiumPage' });

  return {
    title: `${t('title')} - TripCalc`,
    description: t('subtitle'),
  };
}

export default async function PremiumPage({ params }: PageProps) {
  const { locale } = await params;
  const session = await auth();

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

  // @ts-ignore - isPremium is extended on session type
  const isPremium = session?.user?.isPremium === true || session?.user?.isAdmin === true;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header locale={locale} translations={headerTranslations} />

      <main className="container mx-auto px-4 py-8">
        <PremiumPageContent
          locale={locale}
          isLoggedIn={!!session?.user}
          isPremium={isPremium}
          userName={session?.user?.name || ''}
          userEmail={session?.user?.email || ''}
        />
      </main>
    </div>
  );
}
