'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface SharedTripCopyButtonProps {
  tripId: string;
  locale: string;
}

export default function SharedTripCopyButton({ tripId, locale }: SharedTripCopyButtonProps) {
  const t = useTranslations('trips');
  const router = useRouter();
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async () => {
    setIsCopying(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/copy`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to copy');

      const data = await response.json();
      setCopySuccess(true);
      setTimeout(() => {
        router.push(`/${locale}/trips/${data.trip.id}`);
      }, 1000);
    } catch (error) {
      console.error('Error copying trip:', error);
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mx-4 mt-4 flex items-center justify-between">
      <p className="text-sm text-gray-900 font-medium">
        {t('sharedTrip')}
      </p>
      <button
        onClick={handleCopy}
        disabled={isCopying || copySuccess}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
          copySuccess
            ? 'bg-green-600 text-white'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isCopying ? '...' : copySuccess ? t('tripCopied') : t('copyToMyTrips')}
      </button>
    </div>
  );
}
