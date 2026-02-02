'use client'

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { SignInButton } from './auth/SignInButton';
import { UserMenu } from './auth/UserMenu';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  locale: string;
  activeSection?: 'home' | 'cities' | 'calculators' | 'about' | 'trips';
  translations: {
    home: string;
    cities: string;
    calculators: string;
    about: string;
    logoAlt: string;
  };
}

export default function Header({ locale, activeSection = 'home', translations }: HeaderProps) {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
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

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
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
            href={`/${locale}/calculators/luggage`}
            className={`transition ${
              activeSection === 'calculators'
                ? 'text-gray-900 font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {translations.calculators}
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
          <LanguageSwitcher />
          {status === 'loading' ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          ) : session ? (
            <UserMenu />
          ) : (
            <SignInButton />
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
            <Link
              href={`/${locale}`}
              className={`block py-2 ${
                activeSection === 'home'
                  ? 'text-gray-900 font-semibold'
                  : 'text-gray-600'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {translations.home}
            </Link>
            <Link
              href={`/${locale}/cities`}
              className={`block py-2 ${
                activeSection === 'cities'
                  ? 'text-gray-900 font-semibold'
                  : 'text-gray-600'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {translations.cities}
            </Link>
            <Link
              href={`/${locale}/calculators/luggage`}
              className={`block py-2 ${
                activeSection === 'calculators'
                  ? 'text-gray-900 font-semibold'
                  : 'text-gray-600'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {translations.calculators}
            </Link>
            <Link
              href={`/${locale}/about`}
              className={`block py-2 ${
                activeSection === 'about'
                  ? 'text-gray-900 font-semibold'
                  : 'text-gray-600'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {translations.about}
            </Link>

            <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
              <LanguageSwitcher />
              {status === 'loading' ? (
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              ) : session ? (
                <UserMenu />
              ) : (
                <SignInButton />
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
