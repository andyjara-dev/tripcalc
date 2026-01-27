'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface HeaderProps {
  locale: string;
  activeSection?: 'home' | 'cities' | 'about';
}

export default function Header({ locale, activeSection = 'home' }: HeaderProps) {
  const t = useTranslations();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="TripCalc"
            width={120}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </Link>
        <div className="flex gap-8">
          <Link
            href={`/${locale}`}
            className={`transition ${
              activeSection === 'home'
                ? 'text-gray-900 font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('nav.home')}
          </Link>
          <Link
            href={`/${locale}/cities`}
            className={`transition ${
              activeSection === 'cities'
                ? 'text-gray-900 font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('nav.cities')}
          </Link>
          <Link
            href={`/${locale}/about`}
            className={`transition ${
              activeSection === 'about'
                ? 'text-gray-900 font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('nav.about')}
          </Link>
        </div>
      </nav>
    </header>
  );
}
