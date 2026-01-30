'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

interface Trip {
  id: string;
  name: string;
  cityId: string;
  cityName: string;
  startDate: Date | null;
  endDate: Date | null;
  days: number;
  tripStyle: 'BUDGET' | 'MID_RANGE' | 'LUXURY';
  createdAt: Date;
  updatedAt: Date;
  _count: {
    customItems: number;
  };
}

interface TripCardProps {
  trip: Trip;
}

export default function TripCard({ trip }: TripCardProps) {
  const t = useTranslations('trips');
  const locale = useLocale();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(t('deleteConfirm'))) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/trips/${trip.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete trip');
      }

      // Refresh the page
      router.refresh();
    } catch (error) {
      console.error('Error deleting trip:', error);
      alert('Failed to delete trip');
      setIsDeleting(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTripStyleLabel = () => {
    switch (trip.tripStyle) {
      case 'BUDGET':
        return 'Budget';
      case 'MID_RANGE':
        return 'Mid-range';
      case 'LUXURY':
        return 'Luxury';
    }
  };

  const getTripStyleColor = () => {
    switch (trip.tripStyle) {
      case 'BUDGET':
        return 'bg-green-100 text-green-800';
      case 'MID_RANGE':
        return 'bg-blue-100 text-blue-800';
      case 'LUXURY':
        return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      <Link href={`/${locale}/trips/${trip.id}`} className="block">
        <div className="p-6">
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
              {trip.days} {trip.days === 1 ? 'day' : 'days'}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTripStyleColor()}`}>
              {getTripStyleLabel()}
            </span>
            {trip._count.customItems > 0 && (
              <span className="text-sm text-gray-600">
                ✨ {trip._count.customItems} custom {trip._count.customItems === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>

          {/* Last Updated */}
          <p className="text-xs text-gray-500">
            Updated {new Date(trip.updatedAt).toLocaleDateString(locale, {
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      </Link>

      {/* Actions */}
      <div className="border-t border-gray-200 px-6 py-3 flex justify-between items-center bg-gray-50">
        <Link
          href={`/${locale}/trips/${trip.id}`}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {t('viewTrip')}
        </Link>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : t('delete')}
        </button>
      </div>
    </div>
  );
}
