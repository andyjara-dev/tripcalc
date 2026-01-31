'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import LuggageConfig from './LuggageConfig';
import PackingList from './PackingList';
import WeightTracker from './WeightTracker';

type PackingParams = {
  luggageType: 'carry-on' | 'checked' | 'backpack' | 'custom';
  weightLimit: number;
  dimensions?: string;
  duration: number;
  tripType: 'business' | 'leisure' | 'adventure' | 'beach' | 'ski' | 'city';
  climate: 'cold' | 'mild' | 'warm' | 'hot' | 'mixed';
  gender: 'male' | 'female' | 'unisex';
  activities?: string[];
};

type PackingListResponse = {
  items: any[];
  totalWeight: number;
  remainingWeight: number;
  tips: string[];
  warnings: string[];
};

type Props = {
  locale: string;
};

export default function LuggageCalculator({ locale }: Props) {
  const t = useTranslations('luggage');
  const [loading, setLoading] = useState(false);
  const [packingList, setPackingList] = useState<PackingListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<PackingParams | null>(null);

  const handleGenerate = async (newParams: PackingParams) => {
    setLoading(true);
    setError(null);
    setParams(newParams);

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

  const handleSave = async () => {
    if (!packingList || !params) return;

    try {
      const response = await fetch('/api/luggage/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          items: packingList.items,
          totalWeight: packingList.totalWeight,
          tips: packingList.tips,
          warnings: packingList.warnings,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save packing list');
      }

      alert(t('savedSuccessfully'));
    } catch (err) {
      alert(t('saveFailed'));
      console.error('Error saving packing list:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('config.title')}</h2>
        <LuggageConfig onGenerate={handleGenerate} loading={loading} locale={locale} />
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
        <>
          {/* Weight Tracker */}
          <WeightTracker
            totalWeight={packingList.totalWeight}
            weightLimit={params.weightLimit * 1000}
            remainingWeight={packingList.remainingWeight}
          />

          {/* Packing List */}
          <PackingList
            data={packingList}
            currency="g"
            onSave={handleSave}
          />
        </>
      )}
    </div>
  );
}
