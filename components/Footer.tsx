'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">TripCalc</h3>
            <p className="text-gray-600 text-sm">{t('tagline')}</p>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-gray-900 text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={`/${locale}/terms`}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {t('terms')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/privacy`}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {t('privacy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gray-900 text-sm mb-3">{t('contact')}</h4>
            <a
              href="mailto:hello@tripcalc.site"
              className="text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              hello@tripcalc.site
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>{t('copyright', { year: currentYear })}</p>
        </div>
      </div>
    </footer>
  );
}
