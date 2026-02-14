'use client';

/**
 * ItineraryPremiumGate Component
 * Paywall for itinerary/timeline premium feature
 */

import { useTranslations } from 'next-intl';
import Link from 'next/link';

type Props = {
  locale: string;
};

export default function ItineraryPremiumGate({ locale }: Props) {
  const t = useTranslations('itinerary.premium');

  return (
    <div className="max-w-5xl mx-auto">
      {/* Feature Preview */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('title')}</h2>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>

        {/* Blurred Preview (2-column layout like real feature) */}
        <div className="bg-gray-100 rounded-lg p-6 mb-6 relative min-h-[500px]">
          <div className="blur-sm">
            {/* Mock preview of itinerary view */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Timeline preview */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-300 rounded-full"></div>
                  <div className="flex-1 h-16 bg-gray-200 rounded"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-300 rounded-full"></div>
                  <div className="flex-1 h-16 bg-gray-200 rounded"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-300 rounded-full"></div>
                  <div className="flex-1 h-16 bg-gray-200 rounded"></div>
                </div>
              </div>

              {/* Map preview */}
              <div className="h-full bg-gray-300 rounded-lg flex items-center justify-center">
                <span className="text-5xl">🗺️</span>
              </div>
            </div>
          </div>

          {/* Upgrade overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-2xl p-8 text-center max-w-md">
              <div className="text-5xl mb-4">👑</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('upgradeTitle')}</h3>
              <p className="text-gray-600 mb-6">{t('upgradeDescription')}</p>

              <Link
                href={`/${locale}/premium`}
                className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105"
              >
                {t('upgradeButton')}
              </Link>

            </div>
          </div>
        </div>
      </div>

      {/* Feature List */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('features.title')}</h3>
        <ul className="space-y-4">
          <li className="flex items-start">
            <span className="text-green-500 mr-3 text-2xl flex-shrink-0">✓</span>
            <div>
              <p className="font-medium text-gray-900">{t('features.timeline')}</p>
              <p className="text-sm text-gray-600">{t('features.timelineDescription')}</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-3 text-2xl flex-shrink-0">✓</span>
            <div>
              <p className="font-medium text-gray-900">{t('features.maps')}</p>
              <p className="text-sm text-gray-600">{t('features.mapsDescription')}</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-3 text-2xl flex-shrink-0">✓</span>
            <div>
              <p className="font-medium text-gray-900">{t('features.routes')}</p>
              <p className="text-sm text-gray-600">{t('features.routesDescription')}</p>
            </div>
          </li>
          <li className="flex items-start">
            <span className="text-green-500 mr-3 text-2xl flex-shrink-0">✓</span>
            <div>
              <p className="font-medium text-gray-900">{t('features.ai')}</p>
              <p className="text-sm text-gray-600">{t('features.aiDescription')}</p>
            </div>
          </li>
        </ul>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <Link
            href={`/${locale}/premium`}
            className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105"
          >
            {t('upgradeButton')}
          </Link>
        </div>
      </div>

      {/* Use Case */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <span className="text-4xl mr-4 flex-shrink-0">💡</span>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">{t('useCase.title')}</h4>
            <p className="text-gray-700">{t('useCase.description')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
