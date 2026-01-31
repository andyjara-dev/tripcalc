'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

type Props = {
  locale: string;
};

export default function PremiumGate({ locale }: Props) {
  const t = useTranslations('luggage.premium');

  return (
    <div className="max-w-3xl mx-auto">
      {/* Feature Preview */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🧳</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('title')}</h2>
          <p className="text-gray-900">{t('subtitle')}</p>
        </div>

        {/* Blurred Preview */}
        <div className="bg-gray-100 rounded-lg p-6 mb-6 relative min-h-[300px]">
          <div className="blur-sm">
            {/* Mock preview of calculator */}
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md">
              <div className="text-5xl mb-4">👑</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('upgradeTitle')}</h3>
              <p className="text-gray-900 mb-6">{t('upgradeDescription')}</p>

              <Link
                href={`/${locale}/premium`}
                className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105"
              >
                {t('upgradeButton')}
              </Link>

              <p className="text-sm text-gray-600 mt-4">
                {t('freeTrialInfo')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('features.title')}</h3>
        <ul className="space-y-3">
          {['aiSuggestions', 'weightCalculation', 'airlinePresets', 'saveExport'].map(key => (
            <li key={key} className="flex items-start">
              <span className="text-green-500 mr-3 text-xl">✓</span>
              <div>
                <p className="font-medium text-gray-900">{t(`features.${key}`)}</p>
                <p className="text-sm text-gray-600">{t(`features.${key}Description`)}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">{t('pricing.title')}</p>
              <p className="text-sm text-gray-600">{t('pricing.subtitle')}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">$4.99</p>
              <p className="text-sm text-gray-600">{t('pricing.perMonth')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial or Use Case */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <span className="text-4xl mr-4">💡</span>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">{t('useCase.title')}</h4>
            <p className="text-gray-900">{t('useCase.description')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
