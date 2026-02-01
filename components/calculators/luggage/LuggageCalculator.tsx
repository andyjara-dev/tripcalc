'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import LuggageConfig from './LuggageConfig';
import PackingList from './PackingList';
import Toast from '@/components/ui/Toast';

type PackingParams = {
  luggageType: 'carry-on' | 'checked' | 'backpack' | 'custom';
  weightLimit: number;
  dimensions?: string;
  duration: number;
  tripType: 'business' | 'leisure' | 'adventure' | 'beach' | 'ski' | 'city';
  climate?: 'cold' | 'mild' | 'warm' | 'hot' | 'mixed';
  gender: 'male' | 'female' | 'unisex';
  activities?: string[];
  // Advanced mode fields
  destination?: string;
  startDate?: string;
  endDate?: string;
};

type PackingListResponse = {
  items: any[];
  totalWeight: number;
  remainingWeight: number;
  tips: string[];
  warnings: string[];
};

type SavedPackingListData = {
  luggageType: 'carry-on' | 'checked' | 'backpack' | 'custom';
  weightLimit: number;
  dimensions?: string;
  duration: number;
  tripType: 'business' | 'leisure' | 'adventure' | 'beach' | 'ski' | 'city';
  climate?: 'cold' | 'mild' | 'warm' | 'hot' | 'mixed';
  gender: 'male' | 'female' | 'unisex';
  destination?: string;
  startDate?: string;
  endDate?: string;
  items: any[];
  tips: string[];
  warnings: string[];
  totalWeight: number;
};

type Props = {
  locale: string;
  initialData?: SavedPackingListData;
  editingListId?: string;
};

export default function LuggageCalculator({ locale, initialData, editingListId }: Props) {
  const t = useTranslations('luggage');
  const [loading, setLoading] = useState(false);
  const [packingList, setPackingList] = useState<PackingListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<PackingParams | null>(null);
  const [isLoadedList, setIsLoadedList] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Pre-populate with saved data if available
  useEffect(() => {
    if (initialData) {
      setParams({
        luggageType: initialData.luggageType,
        weightLimit: initialData.weightLimit,
        dimensions: initialData.dimensions,
        duration: initialData.duration,
        tripType: initialData.tripType,
        climate: initialData.climate,
        gender: initialData.gender,
        destination: initialData.destination,
        startDate: initialData.startDate,
        endDate: initialData.endDate,
      });
      setPackingList({
        items: initialData.items,
        tips: initialData.tips,
        warnings: initialData.warnings,
        totalWeight: initialData.totalWeight,
        remainingWeight: (initialData.weightLimit * 1000) - initialData.totalWeight,
      });
      setIsLoadedList(true);
    }
  }, [initialData]);

  const handleGenerate = async (newParams: PackingParams) => {
    setLoading(true);
    setError(null);
    setParams(newParams);
    setIsLoadedList(false); // Reset when generating a new list

    try {
      const response = await fetch('/api/luggage/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newParams, locale }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate packing list');
      }

      const data = await response.json();
      setPackingList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error generating packing list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (tripId?: string, updatedItems?: any[]) => {
    if (!packingList || !params) return;

    try {
      const response = await fetch('/api/luggage/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          tripId,
          listId: editingListId, // Include the ID if editing existing list
          items: updatedItems || packingList.items, // Use updated items if provided
          totalWeight: packingList.totalWeight,
          tips: packingList.tips,
          warnings: packingList.warnings,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save packing list');
      }

      const data = await response.json();
      setToast({ message: t('savedSuccessfully'), type: 'success' });

      // Optionally redirect to trip page if tripId was provided
      if (tripId) {
        setTimeout(() => {
          window.location.href = `/${locale}/trips/${tripId}`;
        }, 1500); // Wait for toast to be visible before redirecting
      }
    } catch (err) {
      setToast({ message: t('saveFailed'), type: 'error' });
      console.error('Error saving packing list:', err);
      throw err; // Re-throw so modal knows it failed
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('config.title')}</h2>
        <LuggageConfig
          onGenerate={handleGenerate}
          loading={loading}
          locale={locale}
          initialParams={params || undefined}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="inline-block animate-spin text-6xl mb-4">🧳</div>
          <p className="text-xl text-gray-900 font-semibold">{t('generating')}</p>
          <p className="text-sm text-gray-600 mt-2">{t('aiThinking')}</p>
          <div className="mt-4 max-w-md mx-auto bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <p className="font-semibold text-red-900">{t('error')}</p>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {packingList && !loading && params && (
        <PackingList
          data={packingList}
          currency="g"
          weightLimit={params.weightLimit * 1000}
          onSave={handleSave}
          isLoadedList={isLoadedList}
        />
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
