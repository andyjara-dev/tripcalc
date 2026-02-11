'use client';

/**
 * ItineraryView Component
 * Main container for itinerary/timeline feature
 * Two-column layout: Timeline + Map (desktop), stacked (mobile)
 */

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type { DayItinerary, ItineraryItem } from '@/lib/types/itinerary';
import type { CityBounds } from '@/lib/services/geocoding';
import TimelineView from './TimelineView';
import MapPanel from './MapPanel';

interface ItineraryViewProps {
  days: DayItinerary[];
  activeDay: number;
  cityId: string;
  cityName: string;
  cityCenter: [number, number]; // [lat, lon]
  cityBounds?: CityBounds;
  currencySymbol: string;
  onDaysChange: (days: DayItinerary[]) => void;
  onActiveDay Change: (dayNumber: number) => void;
}

export default function ItineraryView({
  days,
  activeDay,
  cityId,
  cityName,
  cityCenter,
  cityBounds,
  currencySymbol,
  onDaysChange,
  onActiveDayChange,
}: ItineraryViewProps) {
  const t = useTranslations('itinerary');
  const [highlightedItemId, setHighlightedItemId] = useState<string | undefined>();

  // Get current day
  const currentDay = days.find((d) => d.dayNumber === activeDay);

  if (!currentDay) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>{t('dayNotFound')}</p>
      </div>
    );
  }

  // Handle items change for current day
  const handleItemsChange = useCallback(
    (newItems: ItineraryItem[]) => {
      const updatedDays = days.map((d) =>
        d.dayNumber === activeDay
          ? { ...d, customItems: newItems }
          : d
      );
      onDaysChange(updatedDays);
    },
    [days, activeDay, onDaysChange]
  );

  // Handle marker click
  const handleMarkerClick = useCallback((itemId: string) => {
    setHighlightedItemId(itemId);

    // Clear highlight after 3 seconds
    setTimeout(() => {
      setHighlightedItemId(undefined);
    }, 3000);

    // Scroll to activity card
    const element = document.getElementById(`activity-${itemId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('itineraryFor')} {cityName}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {t('day')} {activeDay} {currentDay.dayName && `• ${currentDay.dayName}`}
          </p>
        </div>

        {/* Help text */}
        <div className="text-xs text-gray-500 text-right max-w-xs">
          {t('itineraryHelpText')}
        </div>
      </div>

      {/* Layout: Desktop 2-column, Mobile stack */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Timeline */}
        <div>
          <TimelineView
            items={currentDay.customItems as ItineraryItem[]}
            currencySymbol={currencySymbol}
            cityBounds={cityBounds}
            onItemsChange={handleItemsChange}
            highlightedItemId={highlightedItemId}
          />
        </div>

        {/* Right column: Map (sticky on desktop) */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <MapPanel
            items={currentDay.customItems as ItineraryItem[]}
            cityCenter={cityCenter}
            onMarkerClick={handleMarkerClick}
            defaultCollapsed={false}
          />
        </div>
      </div>

      {/* Mobile hint */}
      <div className="lg:hidden text-center text-xs text-gray-500 mt-8">
        💡 {t('mobileMapHint')}
      </div>
    </div>
  );
}
