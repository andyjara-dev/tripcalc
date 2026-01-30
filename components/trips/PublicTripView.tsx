'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import type { DayPlan, TripStyle } from '@/types/trip-planner';
import { calculateDayCost, calculateTripTotal } from '@/types/trip-planner';
import { getCityById } from '@/data/cities';
import { getEffectiveCosts } from '@/lib/utils/trip-costs';
import BudgetVsActual from './BudgetVsActual';
import type { ExpenseDisplay } from '@/lib/validations/expense';

interface PublicTripViewProps {
  trip: {
    id: string;
    name: string;
    cityId: string;
    cityName: string;
    startDate: Date | null;
    endDate: Date | null;
    days: number;
    tripStyle: 'BUDGET' | 'MID_RANGE' | 'LUXURY';
    calculatorState: any;
    budgetAccommodation?: number | null;
    budgetFood?: number | null;
    budgetTransport?: number | null;
    budgetActivities?: number | null;
    expenses?: ExpenseDisplay[];
  };
  locale: string;
}

export default function PublicTripView({ trip, locale }: PublicTripViewProps) {
  const t = useTranslations('calculator');
  const tTrips = useTranslations('trips');

  const tripStyleMap = {
    BUDGET: 'budget',
    MID_RANGE: 'midRange',
    LUXURY: 'luxury',
  } as const;

  const tripStyle: TripStyle = tripStyleMap[trip.tripStyle] || 'midRange';
  const days: DayPlan[] = trip.calculatorState as DayPlan[];

  const city = getCityById(trip.cityId);
  if (!city) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">City not found</h1>
          <p className="text-gray-600">This trip references a city that doesn't exist.</p>
        </div>
      </div>
    );
  }

  const cityDefaults = city.dailyCosts[tripStyle];
  const costs = getEffectiveCosts(trip, cityDefaults);
  const tripTotal = calculateTripTotal(days, costs);
  const expenses = trip.expenses || [];

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString(locale, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-2 text-sm mb-2">
            <span>🌐</span>
            <span>{tTrips('sharedTrip')}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{trip.name}</h1>
          <div className="flex items-center gap-4 text-blue-100">
            <span className="flex items-center gap-2">
              <span>📍</span>
              <span>{trip.cityName}</span>
            </span>
            {trip.startDate && (
              <span className="flex items-center gap-2">
                <span>📅</span>
                <span>
                  {formatDate(trip.startDate)}
                  {trip.endDate && ` - ${formatDate(trip.endDate)}`}
                </span>
              </span>
            )}
            <span className="flex items-center gap-2">
              <span>⏱️</span>
              <span>{trip.days} {trip.days === 1 ? 'day' : 'days'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Trip Summary */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Trip Summary</h2>

          {/* Budget Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">{t('accommodation')}</p>
              <p className="text-xl font-bold text-gray-900">
                {city.currencySymbol}{costs.accommodation.toFixed(0)}
                <span className="text-sm font-normal text-gray-600"> /day</span>
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">{t('food')}</p>
              <p className="text-xl font-bold text-gray-900">
                {city.currencySymbol}{costs.food.toFixed(0)}
                <span className="text-sm font-normal text-gray-600"> /day</span>
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">{t('transport')}</p>
              <p className="text-xl font-bold text-gray-900">
                {city.currencySymbol}{costs.transport.toFixed(0)}
                <span className="text-sm font-normal text-gray-600"> /day</span>
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">{t('activities')}</p>
              <p className="text-xl font-bold text-gray-900">
                {city.currencySymbol}{costs.activities.toFixed(0)}
                <span className="text-sm font-normal text-gray-600"> /day</span>
              </p>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-700">
                Total Trip ({days.length} {days.length === 1 ? 'day' : 'days'}):
              </span>
              <span className="text-3xl font-bold text-gray-900">
                {city.currencySymbol}{tripTotal.toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-gray-600 text-right mt-1">
              Average per day: {city.currencySymbol}{(tripTotal / days.length).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Budget vs Actual (if expenses exist) */}
        {expenses.length > 0 && (
          <div className="mb-8">
            <BudgetVsActual
              budget={costs}
              expenses={expenses}
              days={days.length}
              currencySymbol={city.currencySymbol}
            />
          </div>
        )}

        {/* Day breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Daily Breakdown</h3>
          <div className="space-y-2">
            {days.map(day => {
              const dayCost = calculateDayCost(day, costs);
              return (
                <div
                  key={day.dayNumber}
                  className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50"
                >
                  <span className="text-gray-700 font-medium">
                    {day.date || `Day ${day.dayNumber}`}
                    {day.dayName && <span className="text-gray-500 ml-2">• {day.dayName}</span>}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {city.currencySymbol}{dayCost.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA to create own trip */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Plan Your Own Trip
          </h3>
          <p className="text-gray-700 mb-4">
            Create your own detailed trip plan with TripCalc's free tools
          </p>
          <Link
            href={`/${locale}/cities/${trip.cityId}`}
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Planning for {trip.cityName}
          </Link>
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-gray-600 mt-8">
          Powered by <Link href={`/${locale}`} className="text-blue-600 hover:underline">TripCalc</Link> - Real travel costs, no surprises
        </p>
      </div>
    </div>
  );
}
