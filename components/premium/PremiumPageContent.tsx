'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

type Props = {
  locale: string;
  isLoggedIn: boolean;
  isPremium: boolean;
  userName: string;
  userEmail: string;
};

function FeatureList() {
  const t = useTranslations('premiumPage');

  const features = [
    { icon: '📅', key: 'itinerary' },
    { icon: '🗺️', key: 'maps' },
    { icon: '🧳', key: 'luggage' },
    { icon: '🤖', key: 'ai' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('featuresTitle')}</h3>
      <ul className="space-y-4">
        {features.map(({ icon, key }) => (
          <li key={key} className="flex items-start">
            <span className="text-2xl mr-3 flex-shrink-0">{icon}</span>
            <div>
              <p className="font-medium text-gray-900">{t(`features.${key}`)}</p>
              <p className="text-sm text-gray-600">{t(`features.${key}Description`)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PremiumPageContent({ locale, isLoggedIn, isPremium, userName, userEmail }: Props) {
  const t = useTranslations('premiumPage');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 10) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/premium/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Request failed');
      }

      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Already premium
  if (isPremium) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👑</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('alreadyPremium')}</h2>
          <p className="text-gray-700">{t('alreadyPremiumDescription')}</p>
        </div>

        <FeatureList />
      </div>
    );
  }

  // Not logged in
  if (!isLoggedIn) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👑</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>

        <FeatureList />

        <div className="text-center">
          <Link
            href={`/${locale}/auth/signin`}
            className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-105"
          >
            {t('signInToRequest')}
          </Link>
        </div>
      </div>
    );
  }

  // Logged in, not premium — show form
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">👑</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
        <p className="text-gray-600">{t('subtitle')}</p>
      </div>

      <FeatureList />

      {status === 'success' ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('requestSent')}</h2>
          <p className="text-gray-700">{t('requestSentDescription')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('requestTitle')}</h3>
          <p className="text-gray-600 mb-4">{t('requestDescription')}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('name')}</label>
              <input
                type="text"
                value={userName}
                readOnly
                className="w-full bg-gray-100 text-gray-900 border border-gray-300 rounded-lg px-3 py-2 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
              <input
                type="email"
                value={userEmail}
                readOnly
                className="w-full bg-gray-100 text-gray-900 border border-gray-300 rounded-lg px-3 py-2 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('reasonLabel')}</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('reasonPlaceholder')}
                required
                minLength={10}
                rows={4}
                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 placeholder:text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">{t('reasonHint')}</p>
            </div>

            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {errorMessage || t('requestError')}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || reason.trim().length < 10}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {status === 'loading' ? t('sending') : t('submitRequest')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
