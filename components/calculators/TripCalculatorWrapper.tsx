'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import type { CityData } from '@/data/cities';
import DailyCostCalculator from './DailyCostCalculator';
import DayByDayPlanner from './DayByDayPlanner';

interface TripCalculatorWrapperProps {
  city: CityData;
}

type CalculatorMode = 'simple' | 'detailed';

export default function TripCalculatorWrapper({ city }: TripCalculatorWrapperProps) {
  const { data: session, status } = useSession();
  const t = useTranslations('tripPlanner');
  const tAuth = useTranslations('auth');
  const [mode, setMode] = useState<CalculatorMode>('simple');

  const isAuthenticated = status === 'authenticated';

  return (
    <div>
      {/* Mode Toggle (only for authenticated users) */}
      {isAuthenticated && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex gap-3">
            <button
              onClick={() => setMode('simple')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                mode === 'simple'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <div className="font-semibold">{t('quickEstimate')}</div>
              <div className={`text-xs mt-1 ${mode === 'simple' ? 'text-gray-300' : 'text-gray-500'}`}>
                {t('quickEstimateDesc')}
              </div>
            </button>
            <button
              onClick={() => setMode('detailed')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                mode === 'detailed'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <div className="font-semibold flex items-center justify-center gap-2">
                {t('dayByDayPlanner')}
                <span className="text-yellow-400">⭐</span>
              </div>
              <div className={`text-xs mt-1 ${mode === 'detailed' ? 'text-gray-300' : 'text-gray-500'}`}>
                {t('dayByDayPlannerDesc')}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Calculator Content */}
      {mode === 'simple' ? (
        <DailyCostCalculator city={city} />
      ) : (
        <>
          {isAuthenticated ? (
            <DayByDayPlanner city={city} />
          ) : (
            /* Shouldn't happen, but fallback */
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                {t('signInToUse')}
              </h3>
              <p className="text-gray-700 mb-4">
                {t('signInToUseDesc')}
              </p>
              <Link
                href="/auth/signin"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {tAuth('signIn')}
              </Link>
            </div>
          )}
        </>
      )}

      {/* Promo for Anonymous Users (only in simple mode) */}
      {!isAuthenticated && mode === 'simple' && (
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-4">
            <span className="text-4xl">⭐</span>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg mb-2">
                {t('unlockTitle')}
              </h3>
              <p className="text-gray-700 mb-4">
                {t('unlockSubtitle')}
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>{t('feature1')}</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>{t('feature2')}</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>{t('feature3')}</span>
                </li>
                <li className="flex items-start gap-2 text-gray-700">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>{t('feature4')}</span>
                </li>
              </ul>
              <Link
                href="/auth/signin"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('signInToGetStarted')}
              </Link>
              <Link
                href="/auth/signin"
                className="inline-block ml-3 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
              >
                {t('createAccount')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
