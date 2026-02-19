import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import { auth } from '@/lib/auth';
import Footer from '@/components/Footer';
import ServiceWorkerRegistration from '@/components/pwa/ServiceWorkerRegistration';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tripcalc.site';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'TripCalc - Real Travel Costs, No Surprises',
    template: '%s | TripCalc',
  },
  description: 'Calculate real travel costs for 20+ cities worldwide. Daily budgets, transport prices, and practical tips based on actual experience, not generic averages.',
  keywords: ['travel costs', 'trip calculator', 'travel budget', 'daily cost estimator', 'city travel costs', 'trip planner', 'travel expenses'],
  authors: [{ name: 'TripCalc' }],
  creator: 'TripCalc',
  openGraph: {
    type: 'website',
    siteName: 'TripCalc',
    title: 'TripCalc - Real Travel Costs, No Surprises',
    description: 'Calculate real travel costs for 20+ cities worldwide. Daily budgets, transport prices, and practical tips.',
    url: baseUrl,
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
        alt: 'TripCalc - Real Travel Costs',
      },
    ],
    locale: 'en_US',
    alternateLocale: ['es_ES'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TripCalc - Real Travel Costs, No Surprises',
    description: 'Calculate real travel costs for 20+ cities worldwide. Daily budgets, transport prices, and practical tips.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/icon-192.png',
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      'en': `${baseUrl}/en`,
      'es': `${baseUrl}/es`,
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const session = await auth();

  return (
    <html lang={locale}>
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ServiceWorkerRegistration />
        <SessionProvider session={session}>
          <AnalyticsProvider>
            <NextIntlClientProvider messages={messages} locale={locale}>
              <div className="flex-grow">
                {children}
              </div>
              <Footer />
            </NextIntlClientProvider>
          </AnalyticsProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
