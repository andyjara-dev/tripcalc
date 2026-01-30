'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import type { CityData } from '@/data/cities';
import type { DayPlan, TripPlanDetailed, TripStyle, CustomItemLocal } from '@/types/trip-planner';
import { createDefaultDay, calculateDayCost, calculateTripTotal } from '@/types/trip-planner';
import DayPlanCard from './DayPlanCard';
import SaveTripModal from '../trips/SaveTripModal';

interface DayByDayPlannerProps {
  city: CityData;
}

export default function DayByDayPlanner({ city }: DayByDayPlannerProps) {
  const t = useTranslations('calculator');
  const tTrips = useTranslations('trips');
  const router = useRouter();
  const [tripStyle, setTripStyle] = useState<TripStyle>('midRange');
  const [activeDay, setActiveDay] = useState(1);
  const [days, setDays] = useState<DayPlan[]>([
    createDefaultDay(1),
    createDefaultDay(2),
    createDefaultDay(3),
  ]);
  const [animateTotal, setAnimateTotal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const costs = city.dailyCosts[tripStyle];

  // Load from localStorage
  useEffect(() => {
    const key = `tripcalc_daybyday_${city.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed: TripPlanDetailed = JSON.parse(stored);
        setDays(parsed.days);
        setTripStyle(parsed.tripStyle);
        if (parsed.days.length > 0) {
          setActiveDay(1);
        }
      } catch (e) {
        console.error('Failed to parse day-by-day plan:', e);
      }
    }
  }, [city.id]);

  // Save to localStorage
  useEffect(() => {
    const key = `tripcalc_daybyday_${city.id}`;
    const plan: TripPlanDetailed = {
      cityId: city.id,
      tripStyle,
      days,
    };
    localStorage.setItem(key, JSON.stringify(plan));
  }, [days, tripStyle, city.id]);

  const addDay = () => {
    if (days.length >= 30) {
      alert('Maximum 30 days per trip');
      return;
    }
    const newDay = createDefaultDay(days.length + 1);
    setDays([...days, newDay]);
    setActiveDay(newDay.dayNumber);
  };

  const removeDay = (dayNumber: number) => {
    if (days.length === 1) {
      alert('Trip must have at least 1 day');
      return;
    }
    const newDays = days
      .filter(d => d.dayNumber !== dayNumber)
      .map((d, index) => ({ ...d, dayNumber: index + 1 })); // Renumber
    setDays(newDays);
    setActiveDay(Math.min(activeDay, newDays.length));
  };

  const updateDay = (dayNumber: number, updates: Partial<DayPlan>) => {
    setDays(days.map(d =>
      d.dayNumber === dayNumber ? { ...d, ...updates } : d
    ));
  };

  const duplicateDay = (dayNumber: number) => {
    const dayToCopy = days.find(d => d.dayNumber === dayNumber);
    if (!dayToCopy || days.length >= 30) return;

    const newDay: DayPlan = {
      ...dayToCopy,
      dayNumber: days.length + 1,
      dayName: dayToCopy.dayName ? `${dayToCopy.dayName} (copy)` : undefined,
      date: undefined, // Don't copy date
      customItems: dayToCopy.customItems.map(item => ({
        ...item,
        id: nanoid(), // New IDs for copied items
      })),
    };

    setDays([...days, newDay]);
    setActiveDay(newDay.dayNumber);
  };

  const tripTotal = calculateTripTotal(days, costs);

  // Trigger animation on changes
  useEffect(() => {
    setAnimateTotal(true);
    const timer = setTimeout(() => setAnimateTotal(false), 500);
    return () => clearTimeout(timer);
  }, [days, tripStyle]);

  // Handle save trip
  const handleSaveTrip = async (data: { name: string; startDate?: string; endDate?: string }) => {
    const tripStyleMap = {
      budget: 'BUDGET',
      midRange: 'MID_RANGE',
      luxury: 'LUXURY',
    } as const;

    console.log('Saving trip with data:', {
      name: data.name,
      cityId: city.id,
      cityName: city.name,
      days: days.length,
      tripStyle: tripStyleMap[tripStyle],
    });

    const response = await fetch('/api/trips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        cityId: city.id,
        cityName: city.name,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        days: days.length,
        tripStyle: tripStyleMap[tripStyle],
        calculatorState: days,
      }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('Error saving trip:', error);
      throw new Error(error.error || 'Failed to save trip');
    }

    const result = await response.json();
    console.log('Trip saved successfully:', result);

    // Show success message
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);

    // Optionally redirect to trips page
    // router.push('/trips');
  };

  const activeD = days.find(d => d.dayNumber === activeDay);

  return (
    <div>
      {/* Success notification */}
      {saveSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">
            ✓ {tTrips('saveSuccess')}
          </p>
        </div>
      )}

      {/* Title */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Day-by-Day Trip Planner
          </h2>
          <p className="text-sm text-gray-700">
            Plan your trip day by day with detailed activities and costs
          </p>
        </div>
        <button
          onClick={() => setShowSaveModal(true)}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>💾</span>
          <span>{tTrips('saveTrip')}</span>
        </button>
      </div>

      {/* Trip Style Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">{t('travelStyle')}</label>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setTripStyle('budget')}
            className={`p-3 rounded-lg border-2 transition-all ${
              tripStyle === 'budget'
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold text-sm">{t('budget')}</div>
            <div className={`text-xs ${tripStyle === 'budget' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('basic')}
            </div>
          </button>
          <button
            onClick={() => setTripStyle('midRange')}
            className={`p-3 rounded-lg border-2 transition-all ${
              tripStyle === 'midRange'
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold text-sm">{t('midRange')}</div>
            <div className={`text-xs ${tripStyle === 'midRange' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('comfortable')}
            </div>
          </button>
          <button
            onClick={() => setTripStyle('luxury')}
            className={`p-3 rounded-lg border-2 transition-all ${
              tripStyle === 'luxury'
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold text-sm">{t('luxury')}</div>
            <div className={`text-xs ${tripStyle === 'luxury' ? 'text-gray-200' : 'text-gray-700'}`}>
              {t('premium')}
            </div>
          </button>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {days.map(day => {
            const dayCost = calculateDayCost(day, costs);
            return (
              <button
                key={day.dayNumber}
                onClick={() => setActiveDay(day.dayNumber)}
                className={`px-4 py-3 rounded-lg flex-shrink-0 transition-all ${
                  activeDay === day.dayNumber
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                <div className="font-semibold text-sm">
                  {day.date || `Day ${day.dayNumber}`}
                </div>
                <div className={`text-xs mt-1 ${
                  activeDay === day.dayNumber ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {city.currencySymbol}{dayCost.toFixed(0)}
                </div>
              </button>
            );
          })}
          {days.length < 30 && (
            <button
              onClick={addDay}
              className="px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex-shrink-0 font-semibold text-sm"
            >
              + Add Day
            </button>
          )}
        </div>
      </div>

      {/* Active Day Content */}
      {activeD && (
        <DayPlanCard
          day={activeD}
          city={city}
          costs={costs}
          tripStyle={tripStyle}
          totalDays={days.length}
          onUpdate={updates => updateDay(activeD.dayNumber, updates)}
          onRemove={() => removeDay(activeD.dayNumber)}
          onDuplicate={() => duplicateDay(activeD.dayNumber)}
        />
      )}

      {/* Trip Summary */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6 space-y-4">
        <h3 className="text-xl font-bold text-gray-900">Trip Summary</h3>

        {/* Breakdown per day */}
        <div className="space-y-2">
          {days.map(day => {
            const dayCost = calculateDayCost(day, costs);
            return (
              <div
                key={day.dayNumber}
                className="flex justify-between items-center text-sm cursor-pointer hover:bg-gray-100 p-2 rounded"
                onClick={() => setActiveDay(day.dayNumber)}
              >
                <span className="text-gray-700">
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

        {/* Total */}
        <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
          <span className="text-lg font-medium text-gray-700">
            Total Trip ({days.length} {days.length === 1 ? 'day' : 'days'}):
          </span>
          <span
            className={`text-3xl font-bold transition-all duration-300 ${
              animateTotal ? 'scale-110 text-blue-600' : 'scale-100 text-gray-900'
            }`}
          >
            {city.currencySymbol}{tripTotal.toFixed(2)}
          </span>
        </div>

        {/* Average per day */}
        <div className="text-sm text-gray-600 text-right">
          Average per day: {city.currencySymbol}{(tripTotal / days.length).toFixed(2)}
        </div>
      </div>

      {/* Note */}
      <p className="text-sm text-gray-600 mt-6">
        * Your detailed day-by-day plan is saved locally. Click "Save Trip" to save to your account.
      </p>

      {/* Save Trip Modal */}
      <SaveTripModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveTrip}
        defaultName={`${city.name} Trip`}
      />
    </div>
  );
}
