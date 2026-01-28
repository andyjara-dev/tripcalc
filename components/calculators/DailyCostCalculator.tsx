'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { CityData } from '@/data/cities';

interface DailyCostCalculatorProps {
  city: CityData;
}

type TripStyle = 'budget' | 'midRange' | 'luxury';

interface CategoryToggle {
  accommodation: boolean;
  food: boolean;
  transport: boolean;
  activities: boolean;
}

export default function DailyCostCalculator({ city }: DailyCostCalculatorProps) {
  const t = useTranslations('calculator');
  const [tripStyle, setTripStyle] = useState<TripStyle>('midRange');
  const [days, setDays] = useState(3);
  const [included, setIncluded] = useState<CategoryToggle>({
    accommodation: true,
    food: true,
    transport: true,
    activities: true,
  });
  const [animateTotal, setAnimateTotal] = useState(false);

  const costs = city.dailyCosts[tripStyle];

  const dailyTotal =
    (included.accommodation ? costs.accommodation : 0) +
    (included.food ? costs.food : 0) +
    (included.transport ? costs.transport : 0) +
    (included.activities ? costs.activities : 0);

  const tripTotal = dailyTotal * days;

  const toggleCategory = (category: keyof CategoryToggle) => {
    setIncluded(prev => ({ ...prev, [category]: !prev[category] }));
  };

  // Trigger animation on changes
  useEffect(() => {
    setAnimateTotal(true);
    const timer = setTimeout(() => setAnimateTotal(false), 500);
    return () => clearTimeout(timer);
  }, [tripStyle, days, included]);

  return (
    <div>
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('dailyCost')}</h2>
        <p className="text-sm text-gray-600 mb-8">{t('pricesPerPerson')}</p>
      </div>

      {/* Trip Style Selector */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-4">{t('travelStyle')}</label>
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
            <div className={`text-sm ${tripStyle === 'budget' ? 'text-gray-200' : 'text-gray-500'}`}>{t('basic')}</div>
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
            <div className={`text-sm ${tripStyle === 'midRange' ? 'text-gray-200' : 'text-gray-500'}`}>{t('comfortable')}</div>
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
            <div className={`text-sm ${tripStyle === 'luxury' ? 'text-gray-200' : 'text-gray-500'}`}>{t('premium')}</div>
          </button>
        </div>
      </div>

      {/* Days Selector */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">{t('numberOfDays')}</label>
        <input
          type="range"
          min="1"
          max="30"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="w-full accent-gray-900"
        />
        <div className="text-center text-xl font-semibold text-gray-900 mt-3">{days} {t('days')}</div>
      </div>

      {/* Cost Breakdown with Toggles */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
          {t('includeInBudget') || 'Include in Budget'}
        </h3>
        <div className="space-y-3">
          {/* Accommodation */}
          <div className={`flex justify-between items-center p-5 rounded-lg border-2 transition-all min-h-[60px] ${
            included.accommodation
              ? 'border-gray-900 bg-gray-50'
              : 'border-gray-200 bg-white opacity-50'
          }`}>
            <label className="flex items-center gap-4 cursor-pointer flex-1 py-2">
              <input
                type="checkbox"
                checked={included.accommodation}
                onChange={() => toggleCategory('accommodation')}
                className="w-6 h-6 rounded border-gray-300 text-gray-900 focus:ring-gray-900 focus:ring-2"
              />
              <span className="text-gray-900 font-medium text-base">
                {t('accommodation')} {t('perDay')}
              </span>
            </label>
            <span className={`font-bold text-xl ${included.accommodation ? 'text-gray-900' : 'text-gray-400'}`}>
              {city.currencySymbol}{costs.accommodation.toFixed(0)}
            </span>
          </div>

          {/* Food */}
          <div className={`flex justify-between items-center p-5 rounded-lg border-2 transition-all min-h-[60px] ${
            included.food
              ? 'border-gray-900 bg-gray-50'
              : 'border-gray-200 bg-white opacity-50'
          }`}>
            <label className="flex items-center gap-4 cursor-pointer flex-1 py-2">
              <input
                type="checkbox"
                checked={included.food}
                onChange={() => toggleCategory('food')}
                className="w-6 h-6 rounded border-gray-300 text-gray-900 focus:ring-gray-900 focus:ring-2"
              />
              <span className="text-gray-900 font-medium text-base">
                {t('food')} {t('perDay')}
              </span>
            </label>
            <span className={`font-bold text-xl ${included.food ? 'text-gray-900' : 'text-gray-400'}`}>
              {city.currencySymbol}{costs.food.toFixed(0)}
            </span>
          </div>

          {/* Transport */}
          <div className={`flex justify-between items-center p-5 rounded-lg border-2 transition-all min-h-[60px] ${
            included.transport
              ? 'border-gray-900 bg-gray-50'
              : 'border-gray-200 bg-white opacity-50'
          }`}>
            <label className="flex items-center gap-4 cursor-pointer flex-1 py-2">
              <input
                type="checkbox"
                checked={included.transport}
                onChange={() => toggleCategory('transport')}
                className="w-6 h-6 rounded border-gray-300 text-gray-900 focus:ring-gray-900 focus:ring-2"
              />
              <span className="text-gray-900 font-medium text-base">
                {t('transport')} {t('perDay')}
              </span>
            </label>
            <span className={`font-bold text-xl ${included.transport ? 'text-gray-900' : 'text-gray-400'}`}>
              {city.currencySymbol}{costs.transport.toFixed(0)}
            </span>
          </div>

          {/* Activities */}
          <div className={`flex justify-between items-center p-5 rounded-lg border-2 transition-all min-h-[60px] ${
            included.activities
              ? 'border-gray-900 bg-gray-50'
              : 'border-gray-200 bg-white opacity-50'
          }`}>
            <label className="flex items-center gap-4 cursor-pointer flex-1 py-2">
              <input
                type="checkbox"
                checked={included.activities}
                onChange={() => toggleCategory('activities')}
                className="w-6 h-6 rounded border-gray-300 text-gray-900 focus:ring-gray-900 focus:ring-2"
              />
              <span className="text-gray-900 font-medium text-base">
                {t('activities')} {t('perDay')}
              </span>
            </label>
            <span className={`font-bold text-xl ${included.activities ? 'text-gray-900' : 'text-gray-400'}`}>
              {city.currencySymbol}{costs.activities.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-gray-700">{t('dailyTotal')}</span>
          <span
            className={`text-3xl font-bold transition-all duration-300 ${
              animateTotal ? 'scale-110 text-blue-600' : 'scale-100 text-gray-900'
            }`}
          >
            {city.currencySymbol}{dailyTotal.toFixed(0)}
          </span>
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <span className="text-lg font-medium text-gray-700">{t('tripTotal')} ({days} {t('days')}):</span>
          <span
            className={`text-3xl font-bold transition-all duration-300 ${
              animateTotal ? 'scale-110 text-blue-600' : 'scale-100 text-gray-900'
            }`}
          >
            {city.currencySymbol}{tripTotal.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Note */}
      <p className="text-sm text-gray-500 mt-6">
        {t('estimate')}
      </p>
    </div>
  );
}
