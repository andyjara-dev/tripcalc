'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { nanoid } from 'nanoid';
import type { DayPlan, TripStyle, CustomCosts } from '@/types/trip-planner';
import { createDefaultDay, calculateDayCost, calculateTripTotal } from '@/types/trip-planner';
import DayPlanCard from '../calculators/DayPlanCard';
import SaveTripModal from './SaveTripModal';
import CustomizeCostsModal from './CustomizeCostsModal';
import ShareTripModal from './ShareTripModal';
import ExpensesList from './ExpensesList';
import BudgetVsActual from './BudgetVsActual';
import { getEffectiveCosts, hasCustomCosts, countCustomCosts } from '@/lib/utils/trip-costs';
import type { ExpenseDisplay } from '@/lib/validations/expense';

// Import city data to get costs
import { getCityById } from '@/data/cities';

interface TripViewProps {
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
    shareToken?: string | null;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

export default function TripView({ trip }: TripViewProps) {
  const t = useTranslations('calculator');
  const tTrips = useTranslations('trips');
  const locale = useLocale();
  const router = useRouter();

  // Map DB tripStyle to local type
  const tripStyleMap = {
    BUDGET: 'budget',
    MID_RANGE: 'midRange',
    LUXURY: 'luxury',
  } as const;

  const [tripStyle, setTripStyle] = useState<TripStyle>(
    tripStyleMap[trip.tripStyle] || 'midRange'
  );
  const [activeDay, setActiveDay] = useState(1);
  const [days, setDays] = useState<DayPlan[]>(trip.calculatorState as DayPlan[]);
  const [animateTotal, setAnimateTotal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCustomizeCostsModal, setShowCustomizeCostsModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [expenses, setExpenses] = useState<ExpenseDisplay[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(true);

  // Get city data
  const city = getCityById(trip.cityId);
  if (!city) {
    return <div>City not found</div>;
  }

  // Get effective costs (custom or defaults)
  const cityDefaults = city.dailyCosts[tripStyle];
  const costs = getEffectiveCosts(trip, cityDefaults);

  // Load expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch(`/api/trips/${trip.id}/expenses`);
        if (response.ok) {
          const data = await response.json();
          setExpenses(data.expenses);
        }
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        setExpensesLoading(false);
      }
    };

    fetchExpenses();
  }, [trip.id]);

  // Trigger animation on changes
  useEffect(() => {
    setAnimateTotal(true);
    const timer = setTimeout(() => setAnimateTotal(false), 500);
    return () => clearTimeout(timer);
  }, [days, tripStyle]);

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
      .map((d, index) => ({ ...d, dayNumber: index + 1 }));
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
      date: undefined,
      customItems: dayToCopy.customItems.map(item => ({
        ...item,
        id: nanoid(),
      })),
    };

    setDays([...days, newDay]);
    setActiveDay(newDay.dayNumber);
  };

  const handleRefreshExpenses = async () => {
    try {
      const response = await fetch(`/api/trips/${trip.id}/expenses`);
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses);
      }
    } catch (error) {
      console.error('Error refreshing expenses:', error);
    }
  };

  const handleSaveCustomCosts = async (customCosts: CustomCosts) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/trips/${trip.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          budgetAccommodation: customCosts.accommodation
            ? Math.round(customCosts.accommodation * 100)
            : null,
          budgetFood: customCosts.food
            ? Math.round(customCosts.food * 100)
            : null,
          budgetTransport: customCosts.transport
            ? Math.round(customCosts.transport * 100)
            : null,
          budgetActivities: customCosts.activities
            ? Math.round(customCosts.activities * 100)
            : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save custom costs');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      router.refresh();
    } catch (error) {
      console.error('Error saving custom costs:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTrip = async (data: { name: string; startDate?: string; endDate?: string }) => {
    setIsSaving(true);
    try {
      const tripStyleMapReverse = {
        budget: 'BUDGET',
        midRange: 'MID_RANGE',
        luxury: 'LUXURY',
      } as const;

      const response = await fetch(`/api/trips/${trip.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          startDate: data.startDate || null,
          endDate: data.endDate || null,
          days: days.length,
          tripStyle: tripStyleMapReverse[tripStyle],
          calculatorState: days,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update trip');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      router.refresh();
    } catch (error) {
      console.error('Error updating trip:', error);
      alert('Failed to update trip');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const tripStyleMapReverse = {
        budget: 'BUDGET',
        midRange: 'MID_RANGE',
        luxury: 'LUXURY',
      } as const;

      const response = await fetch(`/api/trips/${trip.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          days: days.length,
          tripStyle: tripStyleMapReverse[tripStyle],
          calculatorState: days,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      router.refresh();
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const tripTotal = calculateTripTotal(days, costs);
  const activeD = days.find(d => d.dayNumber === activeDay);

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString(locale, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Success notification */}
      {saveSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">
            ✓ {tTrips('updateSuccess')}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/${locale}/trips`}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
        >
          <span>←</span>
          <span>Back to My Trips</span>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{trip.name}</h1>
            <div className="flex items-center gap-4 text-gray-600">
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
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
            >
              {tTrips('edit')}
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium flex items-center gap-2"
            >
              <span>{trip.isPublic ? '🌐' : '🔒'}</span>
              <span>{tTrips('share')}</span>
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <span>💾</span>
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customize Costs Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowCustomizeCostsModal(true)}
          className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <span>⚙️</span>
          <span className="font-medium text-gray-900">{tTrips('customizeCosts')}</span>
          {hasCustomCosts(trip) && (
            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
              {tTrips('usingCustomCosts')} ({countCustomCosts(trip)})
            </span>
          )}
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

      {/* Expenses & Budget Tracking */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses List */}
        <div>
          <ExpensesList
            tripId={trip.id}
            expenses={expenses}
            currencySymbol={city.currencySymbol}
            onExpenseAdded={handleRefreshExpenses}
          />
        </div>

        {/* Budget vs Actual */}
        <div>
          {!expensesLoading && (
            <BudgetVsActual
              budget={costs}
              expenses={expenses}
              days={days.length}
              currencySymbol={city.currencySymbol}
            />
          )}
        </div>
      </div>

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

      {/* Edit Modal */}
      <SaveTripModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdateTrip}
        defaultName={trip.name}
      />

      {/* Customize Costs Modal */}
      <CustomizeCostsModal
        isOpen={showCustomizeCostsModal}
        onClose={() => setShowCustomizeCostsModal(false)}
        onSave={handleSaveCustomCosts}
        cityDefaults={cityDefaults}
        currentCosts={{
          accommodation: trip.budgetAccommodation ? trip.budgetAccommodation / 100 : null,
          food: trip.budgetFood ? trip.budgetFood / 100 : null,
          transport: trip.budgetTransport ? trip.budgetTransport / 100 : null,
          activities: trip.budgetActivities ? trip.budgetActivities / 100 : null,
        }}
        currencySymbol={city.currencySymbol}
      />

      {/* Share Trip Modal */}
      <ShareTripModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        tripId={trip.id}
        initialIsPublic={trip.isPublic}
        initialShareToken={trip.shareToken}
      />
    </div>
  );
}
