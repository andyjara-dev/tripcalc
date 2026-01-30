'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { SignInButton } from './auth/SignInButton';
import { UserMenu } from './auth/UserMenu';

interface HeaderProps {
  locale: string;
  activeSection?: 'home' | 'cities' | 'about' | 'trips';
  translations: {
    home: string;
    cities: string;
    about: string;
    logoAlt: string;
  };
}

export default function Header({ locale, activeSection = 'home', translations }: HeaderProps) {
  const { data: session, status } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
      <nav className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt={translations.logoAlt}
            width={800}
            height={267}
            className="h-35 md:h-35 w-auto"
            priority
          />
        </Link>
        <div className="flex items-center gap-8">
          <Link
            href={`/${locale}`}
            className={`transition ${
              activeSection === 'home'
                ? 'text-gray-900 font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {translations.home}
          </Link>
          <Link
            href={`/${locale}/cities`}
            className={`transition ${
              activeSection === 'cities'
                ? 'text-gray-900 font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {translations.cities}
          </Link>
          <Link
            href={`/${locale}/about`}
            className={`transition ${
              activeSection === 'about'
                ? 'text-gray-900 font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {translations.about}
          </Link>
          {status === 'loading' ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          ) : session ? (
            <UserMenu />
          ) : (
            <SignInButton />
          )}
        </div>
      </nav>
    </header>
  );
}
