'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { CustomCosts } from '@/types/trip-planner';

interface CustomizeCostsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (costs: CustomCosts) => Promise<void>;
  cityDefaults: {
    accommodation: number;
    food: number;
    transport: number;
    activities: number;
  };
  currentCosts: CustomCosts;
  currencySymbol: string;
}

export default function CustomizeCostsModal({
  isOpen,
  onClose,
  onSave,
  cityDefaults,
  currentCosts,
  currencySymbol,
}: CustomizeCostsModalProps) {
  const t = useTranslations('trips');
  const tCalc = useTranslations('calculator');

  // State for each category: 'default' | 'custom'
  const [accommodationMode, setAccommodationMode] = useState<'default' | 'custom'>(
    currentCosts.accommodation !== null ? 'custom' : 'default'
  );
  const [foodMode, setFoodMode] = useState<'default' | 'custom'>(
    currentCosts.food !== null ? 'custom' : 'default'
  );
  const [transportMode, setTransportMode] = useState<'default' | 'custom'>(
    currentCosts.transport !== null ? 'custom' : 'default'
  );
  const [activitiesMode, setActivitiesMode] = useState<'default' | 'custom'>(
    currentCosts.activities !== null ? 'custom' : 'default'
  );

  // State for custom values
  const [accommodationValue, setAccommodationValue] = useState(
    currentCosts.accommodation?.toString() || cityDefaults.accommodation.toString()
  );
  const [foodValue, setFoodValue] = useState(
    currentCosts.food?.toString() || cityDefaults.food.toString()
  );
  const [transportValue, setTransportValue] = useState(
    currentCosts.transport?.toString() || cityDefaults.transport.toString()
  );
  const [activitiesValue, setActivitiesValue] = useState(
    currentCosts.activities?.toString() || cityDefaults.activities.toString()
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Calculate total
  const calculateTotal = () => {
    const accommodation = accommodationMode === 'custom'
      ? parseFloat(accommodationValue) || 0
      : cityDefaults.accommodation;
    const food = foodMode === 'custom'
      ? parseFloat(foodValue) || 0
      : cityDefaults.food;
    const transport = transportMode === 'custom'
      ? parseFloat(transportValue) || 0
      : cityDefaults.transport;
    const activities = activitiesMode === 'custom'
      ? parseFloat(activitiesValue) || 0
      : cityDefaults.activities;

    return accommodation + food + transport + activities;
  };

  const defaultTotal =
    cityDefaults.accommodation +
    cityDefaults.food +
    cityDefaults.transport +
    cityDefaults.activities;

  const currentTotal = calculateTotal();

  const handleSave = async () => {
    setError('');
    setIsLoading(true);

    try {
      const costs: CustomCosts = {
        accommodation: accommodationMode === 'custom'
          ? parseFloat(accommodationValue) || null
          : null,
        food: foodMode === 'custom'
          ? parseFloat(foodValue) || null
          : null,
        transport: transportMode === 'custom'
          ? parseFloat(transportValue) || null
          : null,
        activities: activitiesMode === 'custom'
          ? parseFloat(activitiesValue) || null
          : null,
      };

      await onSave(costs);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save custom costs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAll = () => {
    setAccommodationMode('default');
    setFoodMode('default');
    setTransportMode('default');
    setActivitiesMode('default');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('customizeCostsTitle')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Accommodation */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-900 font-medium">
              <span>🏨</span>
              <span>{tCalc('accommodation')}</span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={accommodationMode === 'default'}
                onChange={() => setAccommodationMode('default')}
                className="w-4 h-4"
              />
              <span className="text-gray-700">
                {t('useDefault')} ({currencySymbol}{cityDefaults.accommodation.toFixed(0)}{t('perDay')})
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={accommodationMode === 'custom'}
                onChange={() => setAccommodationMode('custom')}
                className="w-4 h-4"
              />
              <span className="text-gray-700">{t('customCost')}:</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-700">{currencySymbol}</span>
                <input
                  type="number"
                  value={accommodationValue}
                  onChange={(e) => setAccommodationValue(e.target.value)}
                  disabled={accommodationMode === 'default'}
                  min="0"
                  max="10000"
                  step="1"
                  className="w-24 px-2 py-1 border border-gray-300 rounded text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                />
                <span className="text-gray-600 text-sm">{t('perDay')}</span>
              </div>
            </label>
          </div>

          {/* Food */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-900 font-medium">
              <span>🍽️</span>
              <span>{tCalc('food')}</span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={foodMode === 'default'}
                onChange={() => setFoodMode('default')}
                className="w-4 h-4"
              />
              <span className="text-gray-700">
                {t('useDefault')} ({currencySymbol}{cityDefaults.food.toFixed(0)}{t('perDay')})
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={foodMode === 'custom'}
                onChange={() => setFoodMode('custom')}
                className="w-4 h-4"
              />
              <span className="text-gray-700">{t('customCost')}:</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-700">{currencySymbol}</span>
                <input
                  type="number"
                  value={foodValue}
                  onChange={(e) => setFoodValue(e.target.value)}
                  disabled={foodMode === 'default'}
                  min="0"
                  max="10000"
                  step="1"
                  className="w-24 px-2 py-1 border border-gray-300 rounded text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                />
                <span className="text-gray-600 text-sm">{t('perDay')}</span>
              </div>
            </label>
          </div>

          {/* Transport */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-900 font-medium">
              <span>🚇</span>
              <span>{tCalc('transport')}</span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={transportMode === 'default'}
                onChange={() => setTransportMode('default')}
                className="w-4 h-4"
              />
              <span className="text-gray-700">
                {t('useDefault')} ({currencySymbol}{cityDefaults.transport.toFixed(0)}{t('perDay')})
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={transportMode === 'custom'}
                onChange={() => setTransportMode('custom')}
                className="w-4 h-4"
              />
              <span className="text-gray-700">{t('customCost')}:</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-700">{currencySymbol}</span>
                <input
                  type="number"
                  value={transportValue}
                  onChange={(e) => setTransportValue(e.target.value)}
                  disabled={transportMode === 'default'}
                  min="0"
                  max="10000"
                  step="1"
                  className="w-24 px-2 py-1 border border-gray-300 rounded text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                />
                <span className="text-gray-600 text-sm">{t('perDay')}</span>
              </div>
            </label>
          </div>

          {/* Activities */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-900 font-medium">
              <span>🎭</span>
              <span>{tCalc('activities')}</span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={activitiesMode === 'default'}
                onChange={() => setActivitiesMode('default')}
                className="w-4 h-4"
              />
              <span className="text-gray-700">
                {t('useDefault')} ({currencySymbol}{cityDefaults.activities.toFixed(0)}{t('perDay')})
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={activitiesMode === 'custom'}
                onChange={() => setActivitiesMode('custom')}
                className="w-4 h-4"
              />
              <span className="text-gray-700">{t('customCost')}:</span>
              <div className="flex items-center gap-1">
                <span className="text-gray-700">{currencySymbol}</span>
                <input
                  type="number"
                  value={activitiesValue}
                  onChange={(e) => setActivitiesValue(e.target.value)}
                  disabled={activitiesMode === 'default'}
                  min="0"
                  max="10000"
                  step="1"
                  className="w-24 px-2 py-1 border border-gray-300 rounded text-gray-900 disabled:bg-gray-100 disabled:text-gray-500"
                />
                <span className="text-gray-600 text-sm">{t('perDay')}</span>
              </div>
            </label>
          </div>

          {/* Total Preview */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center text-lg">
              <span className="font-medium text-gray-700">{t('totalDaily')}:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">
                  {currencySymbol}{currentTotal.toFixed(2)}
                </span>
                {currentTotal !== defaultTotal && (
                  <span className="text-sm text-gray-500">
                    ({t('was')} {currencySymbol}{defaultTotal.toFixed(2)})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetAll}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              {t('resetAllToDefault')}
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-medium"
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {isLoading ? 'Saving...' : t('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
