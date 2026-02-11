'use client';

/**
 * ItineraryView Component
 * Main container for itinerary/timeline feature
 * Two-column layout: Timeline + Map (desktop), stacked (mobile)
 */

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type { DayItinerary, ItineraryItem, GeoLocation } from '@/lib/types/itinerary';
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
  onActiveDayChange: (dayNumber: number) => void;
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
  const [pickingItemId, setPickingItemId] = useState<string | undefined>();
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

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

  // Handle request to pick location from map
  const handleRequestMapPick = useCallback((itemId: string) => {
    console.log('Pick from map requested for item:', itemId);
    setPickingItemId(itemId);
    // Scroll to map
    const mapElement = document.getElementById('itinerary-map');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Handle map click for picking location
  const handleMapClick = useCallback(async (lat: number, lon: number) => {
    console.log('Map clicked with coordinates:', { lat, lon, pickingItemId });

    if (!pickingItemId) {
      console.log('No item selected for picking - click ignored');
      return;
    }

    console.log('Starting reverse geocoding...');
    setIsReverseGeocoding(true);

    try {
      // Call reverse geocoding API (we need to create this endpoint)
      const response = await fetch('/api/itinerary/reverse-geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat, lon }),
      });

      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();
      console.log('Reverse geocoding response:', data);

      if (data.success && data.location) {
        console.log('Updating item location:', data.location);
        // Update the item with the location
        const updatedItems = currentDay.customItems.map((item) =>
          item.id === pickingItemId
            ? { ...item, location: data.location as GeoLocation }
            : item
        );

        const updatedDays = days.map((d) =>
          d.dayNumber === activeDay
            ? { ...d, customItems: updatedItems }
            : d
        );

        onDaysChange(updatedDays);

        // Clear picking mode
        setPickingItemId(undefined);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      alert(t('reverseGeocodingFailed'));
    } finally {
      setIsReverseGeocoding(false);
    }
  }, [pickingItemId, days, activeDay, currentDay.customItems, onDaysChange, t]);

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
            onRequestMapPick={handleRequestMapPick}
          />
        </div>

        {/* Right column: Map (sticky on desktop) */}
        <div className="lg:sticky lg:top-4 lg:self-start" id="itinerary-map">
          {pickingItemId && (
            <div className="mb-3 p-4 bg-blue-600 text-white rounded-lg shadow-lg animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👇</span>
                  <div>
                    <div className="font-bold text-base">{t('clickMapToSelect')}</div>
                    <div className="text-xs text-blue-100 mt-1">
                      Haz clic en cualquier punto del mapa para seleccionar ubicación
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    console.log('Canceling picking mode');
                    setPickingItemId(undefined);
                  }}
                  className="px-3 py-1 bg-white text-blue-600 text-sm font-medium rounded hover:bg-blue-50 transition-colors"
                >
                  {t('cancel')}
                </button>
              </div>
              {isReverseGeocoding && (
                <div className="mt-3 flex items-center gap-2 text-sm bg-blue-500 rounded px-3 py-2">
                  <div className="animate-spin">⏳</div>
                  <span>{t('gettingAddress')}...</span>
                </div>
              )}
            </div>
          )}
          <MapPanel
            items={currentDay.customItems as ItineraryItem[]}
            cityCenter={cityCenter}
            onMarkerClick={handleMarkerClick}
            defaultCollapsed={false}
            onMapClick={handleMapClick}
            pickingMode={!!pickingItemId}
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
