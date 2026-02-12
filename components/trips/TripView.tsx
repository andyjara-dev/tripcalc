'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { nanoid } from 'nanoid';
import type { DayPlan, TripStyle, CustomCosts } from '@/types/trip-planner';
import { createDefaultDay, calculateDayCost, calculateTripTotal } from '@/types/trip-planner';
import type { DayItinerary, ItineraryItem, GeoLocation } from '@/lib/types/itinerary';
import UnifiedDayView from '../trip/UnifiedDayView';
import BudgetSummaryPanel from '../trip/BudgetSummaryPanel';
import MapPremiumTeaser from '../premium/MapPremiumTeaser';
import SaveTripModal from './SaveTripModal';
import CustomizeCostsModal from './CustomizeCostsModal';
import ShareTripModal from './ShareTripModal';
import ExpensesList from './ExpensesList';
import BudgetVsActual from './BudgetVsActual';
import { WeatherCard } from './WeatherCard';
import MapPanel from '../itinerary/MapPanel';
import SavedLocationsModal from '../itinerary/SavedLocationsModal';
import type { SavedLocation } from '@/lib/types/saved-location';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui/DropdownMenu';
import { getEffectiveCosts, hasCustomCosts, countCustomCosts } from '@/lib/utils/trip-costs';
import type { ExpenseDisplay } from '@/lib/validations/expense';
import { exportTripToPDF } from '@/lib/utils/pdf-export';
import { downloadICalendar } from '@/lib/utils/ical-export';

// Import city data to get costs
import { getCityById } from '@/data/cities';

interface PackingListProp {
  name?: string;
  luggageType: string;
  weightLimit: number;
  totalWeight: number;
  items: Array<{
    category: string;
    name: string;
    quantity: number;
    weightPerItem: number;
    totalWeight: number;
    essential: boolean;
  }>;
  tips: string[];
  warnings: string[];
}

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
  isPremium?: boolean;
  packingLists?: PackingListProp[];
}

export default function TripView({ trip, isPremium = false, packingLists }: TripViewProps) {
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
  // Parse calculatorState: supports both array (legacy) and object { days, savedLocations } format
  const parsedState = (() => {
    const cs = trip.calculatorState as any;
    if (Array.isArray(cs)) {
      // Legacy format: calculatorState is just DayPlan[]
      return { days: cs as DayPlan[], savedLocations: [] as SavedLocation[] };
    }
    // New format: { days: DayPlan[], savedLocations: SavedLocation[] }
    return {
      days: (cs?.days || []) as DayPlan[],
      savedLocations: (cs?.savedLocations || []) as SavedLocation[],
    };
  })();

  const [activeDay, setActiveDay] = useState(1);
  const [days, setDays] = useState<DayPlan[]>(parsedState.days);
  const [animateTotal, setAnimateTotal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCustomizeCostsModal, setShowCustomizeCostsModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingCalendar, setIsExportingCalendar] = useState(false);
  const [expenses, setExpenses] = useState<ExpenseDisplay[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [highlightedItemId, setHighlightedItemId] = useState<string | undefined>();
  const [pickingItemId, setPickingItemId] = useState<string | undefined>();
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>(parsedState.savedLocations);
  const [showSavedLocationsModal, setShowSavedLocationsModal] = useState(false);

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

      const calculatorState = { days, savedLocations };

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
          calculatorState,
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

      // Store as object { days, savedLocations } so both persist in JSON
      const calculatorState = { days, savedLocations };

      const response = await fetch(`/api/trips/${trip.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          days: days.length,
          tripStyle: tripStyleMapReverse[tripStyle],
          calculatorState,
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

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Load logo as data URL (optimized small version)
      let logoDataUrl: string | undefined;
      try {
        const response = await fetch('/logo-small.png');
        const blob = await response.blob();
        logoDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error('Error loading logo:', error);
      }

      // Fetch weather data for premium PDF
      let weatherData: { days: Array<{ date: string; tempMin: number; tempMax: number; weatherIcon: string; weatherDescription: string; precipitationProb: number }> } | undefined;
      if (isPremium && trip.startDate && trip.endDate) {
        try {
          const startDateISO = new Date(trip.startDate).toISOString().split('T')[0];
          const endDateISO = new Date(trip.endDate).toISOString().split('T')[0];
          const weatherResponse = await fetch(
            `/api/weather?cityId=${trip.cityId}&startDate=${startDateISO}&endDate=${endDateISO}`
          );
          if (weatherResponse.ok) {
            const weatherResult = await weatherResponse.json();
            if (weatherResult.days) {
              weatherData = { days: weatherResult.days };
            }
          }
        } catch (error) {
          console.error('Error fetching weather for PDF:', error);
        }
      }

      const tripStyleLabels = {
        budget: t('budget'),
        midRange: t('midRange'),
        luxury: t('luxury'),
      };

      await exportTripToPDF({
        tripName: trip.name,
        cityName: trip.cityName,
        startDate: trip.startDate ? formatDate(trip.startDate) : null,
        endDate: trip.endDate ? formatDate(trip.endDate) : null,
        days: days.length,
        tripStyle: tripStyleLabels[tripStyle],
        currencySymbol: city.currencySymbol,
        locale,
        costs,
        dailyPlans: days,
        tripTotal,
        expenses,
        logoDataUrl,
        isPremium,
        weatherData,
        packingLists: isPremium ? packingLists : undefined,
        translations: {
          tripDetails: tTrips('tripDetails'),
          city: tTrips('city'),
          dates: tTrips('dates'),
          duration: tTrips('duration'),
          style: tTrips('style'),
          budgetBreakdown: tTrips('budgetBreakdown'),
          accommodation: t('accommodation'),
          food: t('food'),
          transport: t('transport'),
          activities: t('activities'),
          perDay: tTrips('perDay'),
          dailyBreakdown: tTrips('dailyBreakdown'),
          day: tTrips('day'),
          days: tTrips('days'),
          totalTrip: tTrips('totalTrip'),
          averagePerDay: tTrips('averagePerDay'),
          budgetVsActual: tTrips('budgetVsActual'),
          budgeted: tTrips('budgeted'),
          actual: tTrips('actual'),
          generatedBy: tTrips('generatedBy'),
          pdfItinerary: tTrips('pdfItinerary'),
          pdfWeather: tTrips('pdfWeather'),
          pdfPackingList: tTrips('pdfPackingList'),
          pdfWeight: tTrips('pdfWeight'),
          pdfEssential: tTrips('pdfEssential'),
          pdfItems: tTrips('pdfItems'),
          pdfTime: tTrips('pdfTime'),
          pdfLocation: tTrips('pdfLocation'),
          pdfNotes: tTrips('pdfNotes'),
          pdfPremium: tTrips('pdfPremium'),
          pdfActivitiesPlanned: tTrips('pdfActivitiesPlanned'),
          pdfExpensesTracked: tTrips('pdfExpensesTracked'),
          pdfTemperature: tTrips('pdfTemperature'),
          pdfPrecipitation: tTrips('pdfPrecipitation'),
          pdfTips: tTrips('pdfTips'),
          pdfWarnings: tTrips('pdfWarnings'),
          pdfOf: tTrips('pdfOf'),
          pdfTripStats: tTrips('pdfTripStats'),
          pdfDaysPlanned: tTrips('pdfDaysPlanned'),
          catAccommodation: tTrips('categories.ACCOMMODATION'),
          catFood: tTrips('categories.FOOD'),
          catTransport: tTrips('categories.TRANSPORT'),
          catActivities: tTrips('categories.ACTIVITIES'),
          catShopping: tTrips('categories.SHOPPING'),
          catOther: tTrips('categories.OTHER'),
        },
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCalendar = async () => {
    if (!trip.startDate) {
      alert('Please set a start date for your trip first');
      return;
    }

    setIsExportingCalendar(true);
    try {
      downloadICalendar({
        tripName: trip.name,
        cityName: trip.cityName,
        startDate: trip.startDate,
        days,
        costs,
        currencySymbol: city.currencySymbol,
        translations: {
          day: tTrips('day'),
          estimatedCost: tTrips('estimatedCost'),
          accommodation: t('accommodation'),
          food: t('food'),
          transport: t('transport'),
          activities: t('activities'),
          generatedBy: tTrips('generatedBy'),
        },
      });
    } catch (error) {
      console.error('Error exporting calendar:', error);
      alert('Failed to export calendar');
    } finally {
      setIsExportingCalendar(false);
    }
  };

  // Saved locations handler (premium)
  const handleSaveLocations = useCallback(
    (newLocations: SavedLocation[], updatedDays: DayItinerary[]) => {
      setSavedLocations(newLocations);
      setDays(updatedDays as DayPlan[]);
    },
    []
  );

  // Map interaction handlers (premium)
  const handleMarkerClick = useCallback((itemId: string) => {
    setHighlightedItemId(itemId);
    setTimeout(() => setHighlightedItemId(undefined), 3000);
    const element = document.getElementById(`activity-${itemId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const handleRequestMapPick = useCallback((itemId: string) => {
    setPickingItemId(itemId);
    const mapElement = document.getElementById('itinerary-map');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleMapClick = useCallback(async (lat: number, lon: number) => {
    if (!pickingItemId || !activeD) return;

    setIsReverseGeocoding(true);
    try {
      const response = await fetch('/api/itinerary/reverse-geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon }),
      });

      if (!response.ok) throw new Error('Reverse geocoding failed');

      const data = await response.json();
      if (data.success && data.location) {
        const updatedItems = activeD.customItems.map((item) =>
          item.id === pickingItemId
            ? { ...item, location: data.location as GeoLocation }
            : item
        );
        updateDay(activeD.dayNumber, { customItems: updatedItems });
        setPickingItemId(undefined);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    } finally {
      setIsReverseGeocoding(false);
    }
  }, [pickingItemId, activeD]);

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
            <DropdownMenu>
              <DropdownMenuTrigger>
                <span>⋮</span>
                <span>{tTrips('actions')}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                  <span>✏️</span>
                  <span>{tTrips('edit')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowShareModal(true)}>
                  <span>{trip.isPublic ? '🌐' : '🔒'}</span>
                  <span>{tTrips('share')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting}>
                  <span>📄</span>
                  <span>{isExporting ? tTrips('generatingPDF') : tTrips('exportPDF')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleExportCalendar}
                  disabled={isExportingCalendar || !trip.startDate}
                >
                  <span>📅</span>
                  <span>{isExportingCalendar ? tTrips('exportingCalendar') : tTrips('addToCalendar')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <span>💾</span>
              <span>{isSaving ? 'Saving...' : tTrips('saveChanges')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Weather Card */}
      <WeatherCard
        cityId={trip.cityId}
        startDate={trip.startDate}
        endDate={trip.endDate}
      />

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
            <div className={`text-xs ${tripStyle === 'budget' ? 'text-gray-300' : 'text-gray-700'}`}>
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
            <div className={`text-xs ${tripStyle === 'midRange' ? 'text-gray-300' : 'text-gray-700'}`}>
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
            <div className={`text-xs ${tripStyle === 'luxury' ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('premium')}
            </div>
          </button>
        </div>
      </div>

      {/* Daily Planning */}
      <details open className="border border-gray-200 rounded-lg p-4 mb-6">
        <summary className="font-bold text-xl cursor-pointer flex items-center gap-2 text-gray-900 hover:text-blue-600 transition-colors">
          <span>📅</span>
          <span>{tTrips('dailyPlanning')}</span>
        </summary>
        <div className="mt-4 space-y-4">
          {/* Day Tabs */}
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

          {/* Unified Day View: Activities + Map/Budget sidebar */}
          {activeD && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Activities (2/3 width on desktop) */}
              <div className="lg:col-span-2">
                <UnifiedDayView
                  day={activeD}
                  city={city}
                  costs={costs}
                  currencySymbol={city.currencySymbol}
                  isPremium={isPremium}
                  totalDays={days.length}
                  savedLocations={savedLocations}
                  cityBounds={{
                    north: city.latitude + 0.1,
                    south: city.latitude - 0.1,
                    east: city.longitude + 0.1,
                    west: city.longitude - 0.1,
                  }}
                  onUpdate={updates => updateDay(activeD.dayNumber, updates)}
                  onRemove={() => removeDay(activeD.dayNumber)}
                  onDuplicate={() => duplicateDay(activeD.dayNumber)}
                  highlightedItemId={highlightedItemId}
                  onRequestMapPick={isPremium ? handleRequestMapPick : undefined}
                />
              </div>

              {/* Right: Map + Budget Summary (1/3 width on desktop) */}
              <div className="lg:sticky lg:top-4 lg:self-start space-y-4">
                {/* Map Panel or Premium Teaser */}
                <div id="itinerary-map">
                  {isPremium ? (
                    <>
                      {/* Manage Saved Locations */}
                      <button
                        onClick={() => setShowSavedLocationsModal(true)}
                        className="w-full mb-3 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <span>📍</span>
                        <span>{tTrips('manageSavedLocations')}</span>
                        {savedLocations.length > 0 && (
                          <span className="text-xs px-2 py-0.5 bg-blue-200 text-blue-800 rounded-full font-medium">
                            {savedLocations.length}
                          </span>
                        )}
                      </button>

                      {pickingItemId && (
                        <div className="mb-3 p-3 bg-blue-600 text-white rounded-lg shadow-lg animate-pulse text-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span>👇</span>
                              <span className="font-bold">Click on the map</span>
                            </div>
                            <button
                              onClick={() => setPickingItemId(undefined)}
                              className="px-2 py-1 bg-white text-blue-600 text-xs font-medium rounded hover:bg-blue-50"
                            >
                              Cancel
                            </button>
                          </div>
                          {isReverseGeocoding && (
                            <div className="mt-2 flex items-center gap-2 text-xs">
                              <div className="animate-spin">⏳</div>
                              <span>Getting address...</span>
                            </div>
                          )}
                        </div>
                      )}
                      <MapPanel
                        items={(activeD.customItems as ItineraryItem[])}
                        cityCenter={[city.latitude, city.longitude]}
                        onMarkerClick={handleMarkerClick}
                        defaultCollapsed={false}
                        onMapClick={handleMapClick}
                        pickingMode={!!pickingItemId}
                      />
                    </>
                  ) : (
                    <MapPremiumTeaser />
                  )}
                </div>

                {/* Budget Summary (hidden on mobile, shown in sidebar on desktop) */}
                <div className="hidden lg:block">
                  <BudgetSummaryPanel
                    items={(activeD.customItems as ItineraryItem[])}
                    baseCosts={costs}
                    includeBase={activeD.includeBase}
                    included={activeD.included}
                    currencySymbol={city.currencySymbol}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </details>

      {/* Expenses & Tracking Accordion */}
      <details className="border border-gray-200 rounded-lg p-4 mb-6">
        <summary className="font-bold text-xl cursor-pointer flex items-center gap-2 text-gray-900 hover:text-blue-600 transition-colors">
          <span>💰</span>
          <span>{tTrips('expensesTracking')}</span>
        </summary>
        <div className="mt-4 space-y-6">
          <ExpensesList
            tripId={trip.id}
            expenses={expenses}
            currencySymbol={city.currencySymbol}
            onExpenseAdded={handleRefreshExpenses}
          />
          {!expensesLoading && (
            <BudgetVsActual
              budget={costs}
              expenses={expenses}
              days={days.length}
              currencySymbol={city.currencySymbol}
            />
          )}
        </div>
      </details>

      {/* Trip Summary Accordion */}
      <details className="border border-gray-200 rounded-lg p-4 mb-6">
        <summary className="font-bold text-xl cursor-pointer flex items-center gap-2 text-gray-900 hover:text-blue-600 transition-colors">
          <span>📊</span>
          <span>{tTrips('tripSummary')}</span>
        </summary>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            {days.map(day => {
              const dayCost = calculateDayCost(day, costs);
              return (
                <div
                  key={day.dayNumber}
                  className="flex justify-between items-center text-sm cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors"
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

          <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
            <span className="text-lg font-medium text-gray-700">
              {tTrips('totalTrip')} ({days.length} {days.length === 1 ? tTrips('day') : tTrips('days')}):
            </span>
            <span
              className={`text-3xl font-bold transition-all duration-300 ${
                animateTotal ? 'scale-110 text-blue-600' : 'scale-100 text-gray-900'
              }`}
            >
              {city.currencySymbol}{tripTotal.toFixed(2)}
            </span>
          </div>

          <div className="text-sm text-gray-600 text-right">
            {tTrips('averagePerDay')}: {city.currencySymbol}{(tripTotal / days.length).toFixed(2)}
          </div>
        </div>
      </details>

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

      {/* Saved Locations Modal (Premium) */}
      {isPremium && (
        <SavedLocationsModal
          isOpen={showSavedLocationsModal}
          onClose={() => setShowSavedLocationsModal(false)}
          savedLocations={savedLocations}
          days={days as DayItinerary[]}
          cityBounds={{
            north: city.latitude + 0.1,
            south: city.latitude - 0.1,
            east: city.longitude + 0.1,
            west: city.longitude - 0.1,
          }}
          onSave={handleSaveLocations}
        />
      )}
    </div>
  );
}
