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
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-bold mb-6">{t('dailyCost')}</h2>

      {/* Trip Style Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-3">Travel Style</label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setTripStyle('budget')}
            className={`p-3 rounded-lg border-2 transition ${
              tripStyle === 'budget'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold">{t('budget')}</div>
            <div className="text-sm text-gray-600">Basic</div>
          </button>
          <button
            onClick={() => setTripStyle('midRange')}
            className={`p-3 rounded-lg border-2 transition ${
              tripStyle === 'midRange'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold">{t('midRange')}</div>
            <div className="text-sm text-gray-600">Comfortable</div>
          </button>
          <button
            onClick={() => setTripStyle('luxury')}
            className={`p-3 rounded-lg border-2 transition ${
              tripStyle === 'luxury'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold">{t('luxury')}</div>
            <div className="text-sm text-gray-600">Premium</div>
          </button>
        </div>
      </div>

      {/* Days Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Number of Days</label>
        <input
          type="range"
          min="1"
          max="30"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-center text-lg font-semibold mt-2">{days} days</div>
      </div>

      {/* Cost Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-700">{t('accommodation')}</span>
          <span className="font-semibold">
            {city.currencySymbol}{costs.accommodation.toFixed(0)}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-700">{t('food')}</span>
          <span className="font-semibold">
            {city.currencySymbol}{costs.food.toFixed(0)}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-700">{t('transport')}</span>
          <span className="font-semibold">
            {city.currencySymbol}{costs.transport.toFixed(0)}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-700">{t('activities')}</span>
          <span className="font-semibold">
            {city.currencySymbol}{costs.activities.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Totals */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium">Daily Total:</span>
          <span className="text-2xl font-bold text-blue-600">
            {city.currencySymbol}{dailyTotal.toFixed(0)}
          </span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <span className="text-lg font-medium">Trip Total ({days} days):</span>
          <span className="text-2xl font-bold text-green-600">
            {city.currencySymbol}{tripTotal.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Note */}
      <p className="text-sm text-gray-600 mt-4">
        * Estimates based on real traveler experience. Actual costs may vary.
      </p>
    </div>
  );
}
