import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../[locale]/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Shared Trip - TripCalc',
  description: 'View shared trip plan',
};

export default function SharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
