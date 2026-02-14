'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

interface SharedTripData {
  id: string;
  trip: {
    id: string;
    name: string;
    cityId: string;
    cityName: string;
    startDate: string | null;
    endDate: string | null;
    days: number;
    tripStyle: 'BUDGET' | 'MID_RANGE' | 'LUXURY';
    createdAt: string;
    updatedAt: string;
  };
  sharedBy: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  createdAt: string;
}

interface SharedTripCardProps {
  sharedTrip: SharedTripData;
}

export default function SharedTripCard({ sharedTrip }: SharedTripCardProps) {
  const t = useTranslations('trips');
  const locale = useLocale();
  const router = useRouter();
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const { trip, sharedBy } = sharedTrip;

  const handleCopy = async () => {
    setIsCopying(true);
    try {
      const response = await fetch(`/api/trips/${trip.id}/copy`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to copy trip');
      }

      setCopySuccess(true);
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error('Error copying trip:', error);
    } finally {
      setIsCopying(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTripStyleLabel = () => {
    switch (trip.tripStyle) {
      case 'BUDGET': return 'Budget';
      case 'MID_RANGE': return 'Mid-range';
      case 'LUXURY': return 'Luxury';
    }
  };

  const getTripStyleColor = () => {
    switch (trip.tripStyle) {
      case 'BUDGET': return 'bg-green-100 text-green-800';
      case 'MID_RANGE': return 'bg-blue-100 text-blue-800';
      case 'LUXURY': return 'bg-purple-100 text-purple-800';
    }
  };

  const sharedByName = sharedBy.name || sharedBy.email || '?';

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      <Link href={`/${locale}/trips/shared/${trip.id}`} className="block">
        <div className="p-6">
          {/* Shared by badge */}
          <div className="flex items-center gap-2 mb-3">
            {sharedBy.image ? (
              <img src={sharedBy.image} alt="" className="w-5 h-5 rounded-full" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                {sharedByName[0].toUpperCase()}
              </div>
            )}
            <span className="text-xs text-gray-600">
              {t('sharedBy', { name: sharedByName })}
            </span>
          </div>

          {/* Trip Name */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {trip.name}
          </h3>

          {/* City */}
          <p className="text-gray-600 mb-3 flex items-center gap-2">
            <span>📍</span>
            <span>{trip.cityName}</span>
          </p>

          {/* Dates */}
          {trip.startDate && (
            <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
              <span>📅</span>
              <span>
                {formatDate(trip.startDate)}
                {trip.endDate && ` - ${formatDate(trip.endDate)}`}
              </span>
            </p>
          )}

          {/* Trip Details */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-sm text-gray-700">
              {trip.days} {trip.days === 1 ? t('day') : t('days')}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTripStyleColor()}`}>
              {getTripStyleLabel()}
            </span>
          </div>
        </div>
      </Link>

      {/* Actions */}
      <div className="border-t border-gray-200 px-6 py-3 flex justify-between items-center bg-gray-50">
        <Link
          href={`/${locale}/trips/shared/${trip.id}`}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {t('viewSharedTrip')}
        </Link>
        <button
          onClick={handleCopy}
          disabled={isCopying || copySuccess}
          className={`text-sm font-medium disabled:opacity-50 ${
            copySuccess
              ? 'text-green-600'
              : 'text-blue-600 hover:text-blue-700'
          }`}
        >
          {isCopying ? '...' : copySuccess ? t('tripCopied') : t('copyToMyTrips')}
        </button>
      </div>
    </div>
  );
}
