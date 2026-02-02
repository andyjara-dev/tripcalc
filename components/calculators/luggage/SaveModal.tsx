'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

type Trip = {
  id: string;
  cityName: string;
  travelStyle: string;
  startDate: string;
  endDate: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tripId?: string, name?: string) => void;
  saving: boolean;
  initialName?: string;
};

export default function SaveModal({ isOpen, onClose, onSave, saving, initialName }: Props) {
  const t = useTranslations('luggage.save');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [listName, setListName] = useState<string>(initialName || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTrips();
      setListName(initialName || '');
    }
  }, [isOpen, initialName]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trips');
      if (response.ok) {
        const data = await response.json();
        setTrips(data.trips || []);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    onSave(selectedTripId || undefined, listName || undefined);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">{t('title')}</h3>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          {t('description')}
        </p>

        {/* List Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            {t('listName')} <span className="text-gray-500">({t('optional')})</span>
          </label>
          <input
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            placeholder={t('listNamePlaceholder')}
            disabled={saving}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white disabled:bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">{t('listNameHint')}</p>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <div className="inline-block animate-spin text-4xl">🔄</div>
            <p className="text-gray-600 mt-2">{t('loadingTrips')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* No trip option */}
            <label className="flex items-start p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input
                type="radio"
                name="trip"
                value=""
                checked={selectedTripId === ''}
                onChange={() => setSelectedTripId('')}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-medium text-gray-900">{t('noTrip')}</div>
                <div className="text-sm text-gray-600">{t('noTripDescription')}</div>
              </div>
            </label>

            {/* Existing trips */}
            {trips.length > 0 && (
              <div className="max-h-64 overflow-y-auto space-y-2">
                <p className="text-sm font-medium text-gray-700">{t('selectTrip')}</p>
                {trips.map((trip) => (
                  <label
                    key={trip.id}
                    className="flex items-start p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                  >
                    <input
                      type="radio"
                      name="trip"
                      value={trip.id}
                      checked={selectedTripId === trip.id}
                      onChange={() => setSelectedTripId(trip.id)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {trip.cityName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {trip.travelStyle} • {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {trips.length === 0 && (
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600 text-sm">{t('noTripsYet')}</p>
                <a
                  href="/trips"
                  className="text-blue-600 hover:underline text-sm"
                >
                  {t('createFirstTrip')}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition disabled:opacity-50"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">🔄</span>
                {t('saving')}
              </span>
            ) : (
              <span className="flex items-center justify-center">
                💾 {t('saveButton')}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
