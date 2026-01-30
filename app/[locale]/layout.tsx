import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { auth } from '@/lib/auth';
import Footer from '@/components/Footer';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TripCalc - Real Travel Costs",
  description: "Calculate real travel costs based on experience, not generic averages.",
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
        <SessionProvider session={session}>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <div className="flex-grow">
              {children}
            </div>
            <Footer />
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
