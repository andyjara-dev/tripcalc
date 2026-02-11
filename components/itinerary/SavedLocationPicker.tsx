'use client';

/**
 * SavedLocationPicker Component
 * Quick dropdown to select a saved location for an activity
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { SavedLocation } from '@/lib/types/saved-location';
import type { GeoLocation } from '@/lib/types/itinerary';
import { getLocationIcon } from '@/lib/types/saved-location';

interface SavedLocationPickerProps {
  savedLocations: SavedLocation[];
  currentLocation?: GeoLocation;
  onSelect: (location: GeoLocation, locationName: string) => void;
}

export default function SavedLocationPicker({
  savedLocations,
  currentLocation,
  onSelect,
}: SavedLocationPickerProps) {
  const t = useTranslations('itinerary');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (savedLocations.length === 0) {
    return null; // Don't show picker if no saved locations
  }

  const handleSelect = (location: SavedLocation) => {
    onSelect(location.location, location.name);
    setIsOpen(false);
  };

  // Separate primary and others
  const primaryLocation = savedLocations.find((loc) => loc.isPrimary);
  const otherLocations = savedLocations.filter((loc) => !loc.isPrimary);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Picker Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap"
        title={t('useSaved')}
      >
        <span>📍</span>
        <span>{t('useSaved')}</span>
        <span className="text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {/* Primary Accommodation */}
          {primaryLocation && (
            <div className="p-2 border-b border-gray-200 bg-blue-50">
              <div className="text-xs font-medium text-gray-600 mb-1 px-2">
                ⭐ {t('primaryAccommodation')}
              </div>
              <LocationOption
                location={primaryLocation}
                isPrimary
                onClick={() => handleSelect(primaryLocation)}
                t={t}
              />
            </div>
          )}

          {/* Other Locations */}
          {otherLocations.length > 0 && (
            <div className="p-2">
              {primaryLocation && (
                <div className="text-xs font-medium text-gray-600 mb-1 px-2">
                  {t('otherLocations')}
                </div>
              )}
              <div className="space-y-1">
                {otherLocations.map((location) => (
                  <LocationOption
                    key={location.id}
                    location={location}
                    isPrimary={false}
                    onClick={() => handleSelect(location)}
                    t={t}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface LocationOptionProps {
  location: SavedLocation;
  isPrimary: boolean;
  onClick: () => void;
  t: any;
}

function LocationOption({ location, isPrimary, onClick, t }: LocationOptionProps) {
  const icon = getLocationIcon(location);
  const categoryLabel = t(`categories.${location.category}`);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-3 py-2 rounded hover:bg-blue-50 transition-colors group"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-900 text-sm truncate">
              {location.name}
            </span>
            {isPrimary && <span className="text-xs">⭐</span>}
          </div>
          <div className="text-xs text-gray-600 truncate">{categoryLabel}</div>
          <div className="text-xs text-gray-500 truncate">{location.location.address}</div>
        </div>
      </div>
    </button>
  );
}
