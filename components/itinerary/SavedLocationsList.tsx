'use client';

/**
 * SavedLocationsList Component
 * Displays list of saved locations with edit/delete actions
 */

import { useTranslations } from 'next-intl';
import type { SavedLocation } from '@/lib/types/saved-location';
import { getLocationIcon } from '@/lib/types/saved-location';

interface SavedLocationsListProps {
  savedLocations: SavedLocation[];
  onEdit: (location: SavedLocation) => void;
  onDelete: (locationId: string) => void;
  onSetPrimary: (locationId: string) => void;
}

export default function SavedLocationsList({
  savedLocations,
  onEdit,
  onDelete,
  onSetPrimary,
}: SavedLocationsListProps) {
  const t = useTranslations('itinerary');

  // Separate primary and other locations
  const primaryLocation = savedLocations.find((loc) => loc.isPrimary);
  const otherLocations = savedLocations.filter((loc) => !loc.isPrimary);

  if (savedLocations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-sm text-gray-600">{t('noSavedLocations')}</p>
        <p className="text-xs text-gray-500 mt-2">{t('addAccommodationHint')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Primary Accommodation */}
      {primaryLocation && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            ⭐ {t('primaryAccommodation')}
          </h3>
          <LocationCard
            location={primaryLocation}
            isPrimary
            onEdit={() => onEdit(primaryLocation)}
            onDelete={() => onDelete(primaryLocation.id)}
            onSetPrimary={() => {}}
            t={t}
          />
        </div>
      )}

      {/* Other Locations */}
      {otherLocations.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            {t('otherLocations')}
          </h3>
          <div className="space-y-2">
            {otherLocations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                isPrimary={false}
                onEdit={() => onEdit(location)}
                onDelete={() => onDelete(location.id)}
                onSetPrimary={() => onSetPrimary(location.id)}
                t={t}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface LocationCardProps {
  location: SavedLocation;
  isPrimary: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSetPrimary: () => void;
  t: any;
}

function LocationCard({
  location,
  isPrimary,
  onEdit,
  onDelete,
  onSetPrimary,
  t,
}: LocationCardProps) {
  const icon = getLocationIcon(location);
  const categoryLabel = t(`categories.${location.category}`);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        {/* Location Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{icon}</span>
            <h4 className="font-medium text-gray-900 truncate">{location.name}</h4>
            {isPrimary && <span className="text-xs">⭐</span>}
          </div>
          <p className="text-xs text-gray-600 mb-1">{categoryLabel}</p>
          <p className="text-xs text-gray-500 truncate">{location.location.address}</p>
          {location.notes && (
            <p className="text-xs text-gray-500 mt-2 italic">{location.notes}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1">
          <button
            onClick={onEdit}
            className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50"
            title={t('editLocation')}
          >
            {t('editLocation')}
          </button>
          {!isPrimary && (
            <button
              onClick={onSetPrimary}
              className="text-xs text-amber-600 hover:text-amber-700 px-2 py-1 rounded hover:bg-amber-50"
              title={t('makePrimary')}
            >
              {t('makePrimary')}
            </button>
          )}
          <button
            onClick={onDelete}
            className="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
            title={t('deleteLocation')}
          >
            {t('deleteLocation')}
          </button>
        </div>
      </div>
    </div>
  );
}
