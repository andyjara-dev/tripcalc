'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export default function MapPremiumTeaser() {
  const t = useTranslations('unifiedView');
  const locale = useLocale();

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      {/* Blurred map preview */}
      <div className="relative h-48 bg-gradient-to-br from-green-100 via-blue-50 to-green-50">
        <div className="absolute inset-0 flex items-center justify-center blur-sm">
          <div className="text-6xl">🗺️</div>
        </div>

        {/* Lock overlay */}
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="text-3xl mb-2">🔒</div>
            <p className="font-semibold text-gray-900 text-sm">{t('mapView')}</p>
          </div>
        </div>
      </div>

      {/* Features & CTA */}
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-3">{t('mapTeaser')}</p>

        <ul className="space-y-1.5 mb-4">
          <li className="flex items-center gap-2 text-xs text-gray-700">
            <span className="text-green-500">✓</span>
            <span>{t('mapFeature1')}</span>
          </li>
          <li className="flex items-center gap-2 text-xs text-gray-700">
            <span className="text-green-500">✓</span>
            <span>{t('mapFeature2')}</span>
          </li>
          <li className="flex items-center gap-2 text-xs text-gray-700">
            <span className="text-green-500">✓</span>
            <span>{t('mapFeature3')}</span>
          </li>
        </ul>

        <Link
          href={`/${locale}/premium`}
          className="block w-full text-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:shadow-md transition transform hover:scale-[1.02]"
        >
          {t('upgradeToPremium')}
        </Link>
      </div>
    </div>
  );
}
