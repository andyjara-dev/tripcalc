'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { CityData } from '@/data/cities';

interface DailyCostCalculatorProps {
  city: CityData;
}

type TripStyle = 'budget' | 'midRange' | 'luxury';

export default function DailyCostCalculator({ city }: DailyCostCalculatorProps) {
  const t = useTranslations('calculator');
  const [tripStyle, setTripStyle] = useState<TripStyle>('midRange');
  const [days, setDays] = useState(3);

  const costs = city.dailyCosts[tripStyle];
  const dailyTotal = costs.accommodation + costs.food + costs.transport + costs.activities;
  const tripTotal = dailyTotal * days;

  return (
    <div className="bg-white rounded-xl p-8 border border-gray-200">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('dailyCost')}</h2>

      {/* Trip Style Selector */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4">Travel Style</label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setTripStyle('budget')}
            className={`p-4 rounded-lg border-2 transition-all ${
              tripStyle === 'budget'
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold">{t('budget')}</div>
            <div className={`text-sm ${tripStyle === 'budget' ? 'text-gray-200' : 'text-gray-500'}`}>Basic</div>
          </button>
          <button
            onClick={() => setTripStyle('midRange')}
            className={`p-4 rounded-lg border-2 transition-all ${
              tripStyle === 'midRange'
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold">{t('midRange')}</div>
            <div className={`text-sm ${tripStyle === 'midRange' ? 'text-gray-200' : 'text-gray-500'}`}>Comfortable</div>
          </button>
          <button
            onClick={() => setTripStyle('luxury')}
            className={`p-4 rounded-lg border-2 transition-all ${
              tripStyle === 'luxury'
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold">{t('luxury')}</div>
            <div className={`text-sm ${tripStyle === 'luxury' ? 'text-gray-200' : 'text-gray-500'}`}>Premium</div>
          </button>
        </div>
      </div>

      {/* Days Selector */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">Number of Days</label>
        <input
          type="range"
          min="1"
          max="30"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="w-full accent-gray-900"
        />
        <div className="text-center text-xl font-semibold text-gray-900 mt-3">{days} days</div>
      </div>

      {/* Cost Breakdown */}
      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <span className="text-gray-700">{t('accommodation')}</span>
          <span className="font-semibold text-gray-900">
            {city.currencySymbol}{costs.accommodation.toFixed(0)}
          </span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <span className="text-gray-700">{t('food')}</span>
          <span className="font-semibold text-gray-900">
            {city.currencySymbol}{costs.food.toFixed(0)}
          </span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <span className="text-gray-700">{t('transport')}</span>
          <span className="font-semibold text-gray-900">
            {city.currencySymbol}{costs.transport.toFixed(0)}
          </span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <span className="text-gray-700">{t('activities')}</span>
          <span className="font-semibold text-gray-900">
            {city.currencySymbol}{costs.activities.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Totals */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-gray-700">Daily Total:</span>
          <span className="text-3xl font-bold text-gray-900">
            {city.currencySymbol}{dailyTotal.toFixed(0)}
          </span>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <span className="text-lg font-medium text-gray-700">Trip Total ({days} days):</span>
          <span className="text-3xl font-bold text-gray-900">
            {city.currencySymbol}{tripTotal.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Note */}
      <p className="text-sm text-gray-500 mt-6">
        * Estimates based on real traveler experience. Actual costs may vary.
      </p>
    </div>
  );
}
