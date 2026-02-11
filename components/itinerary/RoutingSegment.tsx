'use client';

/**
 * RoutingSegment Component
 * Displays route information between two activities
 * Shows distance and link to Google Maps directions
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ItineraryItem } from '@/lib/types/itinerary';
import {
  calculateDistance,
  formatDistance,
  estimateWalkingTime,
  generateGoogleMapsUrl,
} from '@/lib/utils/distance';

interface RoutingSegmentProps {
  from: ItineraryItem;
  to: ItineraryItem;
}

type TravelMode = 'walking' | 'transit' | 'driving' | 'bicycling';

export default function RoutingSegment({ from, to }: RoutingSegmentProps) {
  const t = useTranslations('itinerary.routing');
  const [travelMode, setTravelMode] = useState<TravelMode>('walking');

  // Check if both activities have locations
  if (!from.location || !to.location) {
    return null;
  }

  // Calculate straight-line distance
  const distanceKm = calculateDistance(
    from.location.lat,
    from.location.lon,
    to.location.lat,
    to.location.lon
  );

  // Estimate walking time
  const walkingMinutes = estimateWalkingTime(distanceKm);

  // Generate Google Maps URL
  const mapsUrl = generateGoogleMapsUrl(
    from.location.lat,
    from.location.lon,
    to.location.lat,
    to.location.lon,
    travelMode
  );

  // Icons for travel modes
  const modeIcons = {
    walking: '🚶',
    transit: '🚇',
    driving: '🚗',
    bicycling: '🚴',
  };

  return (
    <div className="relative pl-12 pb-4">
      {/* Timeline connector line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

      {/* Routing card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between gap-3">
          {/* Left side: Mode selector + distance */}
          <div className="flex items-center gap-3 flex-1">
            {/* Travel mode dropdown */}
            <select
              value={travelMode}
              onChange={(e) => setTravelMode(e.target.value as TravelMode)}
              className="px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="walking">{modeIcons.walking} {t('walking')}</option>
              <option value="transit">{modeIcons.transit} {t('transit')}</option>
              <option value="driving">{modeIcons.driving} {t('driving')}</option>
              <option value="bicycling">{modeIcons.bicycling} {t('bicycling')}</option>
            </select>

            {/* Distance info */}
            <div className="text-sm text-gray-700">
              <span className="font-medium">~{formatDistance(distanceKm)}</span>
              {travelMode === 'walking' && (
                <span className="text-gray-600 ml-2">
                  • ~{walkingMinutes} {t('minutes')}
                </span>
              )}
            </div>
          </div>

          {/* Right side: Google Maps button */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <span>🗺️</span>
            <span>{t('viewRoute')}</span>
          </a>
        </div>

        {/* Note about distance */}
        <p className="text-xs text-gray-600 mt-2">
          {t('straightLineNote')}
        </p>
      </div>
    </div>
  );
}
