'use client';

/**
 * MapPanel Component
 * Lazy-loaded map panel with markers for activities
 */

import { useState, useMemo, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import type { ItineraryItem } from '@/lib/types/itinerary';
import type { MapMarker } from './LeafletMap';

// Lazy load Leaflet map (only when panel is expanded)
const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => <MapLoadingSkeleton />,
});

interface MapPanelProps {
  items: ItineraryItem[];
  cityCenter: [number, number]; // [lat, lon]
  onMarkerClick?: (itemId: string) => void;
  defaultCollapsed?: boolean;
}

function MapLoadingSkeleton() {
  return (
    <div className="w-full h-[500px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
      <div className="text-gray-400 text-center">
        <div className="text-3xl mb-2">🗺️</div>
        <p className="text-sm">Loading map...</p>
      </div>
    </div>
  );
}

export default function MapPanel({
  items,
  cityCenter,
  onMarkerClick,
  defaultCollapsed = false,
}: MapPanelProps) {
  const t = useTranslations('itinerary');
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Filter items with location
  const itemsWithLocation = useMemo(
    () => items.filter((item) => item.location),
    [items]
  );

  // Convert items to map markers
  const markers: MapMarker[] = useMemo(() => {
    const sorted = [...itemsWithLocation].sort((a, b) => {
      if (!a.timeSlot?.startTime && !b.timeSlot?.startTime) return 0;
      if (!a.timeSlot?.startTime) return 1;
      if (!b.timeSlot?.startTime) return -1;
      return a.timeSlot.startTime.localeCompare(b.timeSlot.startTime);
    });

    return sorted.map((item, index) => ({
      id: item.id,
      position: [item.location!.lat, item.location!.lon] as [number, number],
      label: item.name,
      number: index + 1,
    }));
  }, [itemsWithLocation]);

  // Toggle collapse
  const toggleCollapse = () => {
    if (!isCollapsed && !isMapLoaded) {
      setIsMapLoaded(true);
    }
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={toggleCollapse}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">🗺️</span>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{t('map')}</h3>
            <p className="text-xs text-gray-600">
              {itemsWithLocation.length} {t('locations')}
            </p>
          </div>
        </div>

        <span className={`text-gray-600 transition-transform ${
          isCollapsed ? '' : 'rotate-180'
        }`}>
          ▼
        </span>
      </button>

      {/* Map content */}
      {!isCollapsed && (
        <div className="p-4">
          {itemsWithLocation.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-3xl mb-3">📍</div>
              <p className="font-medium">{t('noLocationsYet')}</p>
              <p className="text-sm mt-1">{t('addAddressesToSeeMap')}</p>
            </div>
          ) : (
            <Suspense fallback={<MapLoadingSkeleton />}>
              <LeafletMap
                center={markers.length > 0 ? markers[0].position : cityCenter}
                markers={markers}
                height="500px"
                onMarkerClick={onMarkerClick}
              />
            </Suspense>
          )}

          {/* Legend */}
          {markers.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-700 mb-2">
                {t('legend')}:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                    1
                  </div>
                  <span>{t('activityNumber')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{t('clickMarkerToHighlight')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
