'use client';

/**
 * SavedLocationsModal Component
 * Main modal for managing saved locations
 * Contains list view, add view, and edit view
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { SavedLocation } from '@/lib/types/saved-location';
import type { DayItinerary } from '@/lib/types/itinerary';
import type { CityBounds } from '@/lib/services/geocoding';
import {
  autoFillAllDays,
  removeAutoFilledItems,
  updateAutoFilledItems,
  countAutoFilledItems,
} from '@/lib/utils/itinerary-autofill';
import SavedLocationsList from './SavedLocationsList';
import SavedLocationForm from './SavedLocationForm';

interface SavedLocationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedLocations: SavedLocation[];
  days: DayItinerary[];
  cityBounds?: CityBounds;
  onSave: (locations: SavedLocation[], updatedDays: DayItinerary[]) => void;
}

type ViewMode = 'list' | 'add' | 'edit';

export default function SavedLocationsModal({
  isOpen,
  onClose,
  savedLocations: initialLocations,
  days,
  cityBounds,
  onSave,
}: SavedLocationsModalProps) {
  const t = useTranslations('itinerary');

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingLocation, setEditingLocation] = useState<SavedLocation | undefined>();
  const [locations, setLocations] = useState<SavedLocation[]>(initialLocations);
  const [updatedDays, setUpdatedDays] = useState<DayItinerary[]>(days);

  if (!isOpen) return null;

  // Handle add new location
  const handleAddLocation = (newLocation: SavedLocation) => {
    let newLocations = [...locations];
    let newDays = [...updatedDays];

    // If setting as primary, remove primary flag from others
    if (newLocation.isPrimary) {
      const oldPrimary = newLocations.find((loc) => loc.isPrimary);
      newLocations = newLocations.map((loc) => ({ ...loc, isPrimary: false }));

      // If there was an old primary, update auto-filled items
      if (oldPrimary) {
        newDays = updateAutoFilledItems(newDays, oldPrimary.id, newLocation);
      } else {
        // No old primary, auto-fill all days
        const confirmed = confirm(
          'This will add check-in/check-out to all days. Continue?'
        );
        if (confirmed) {
          newDays = autoFillAllDays(newDays, newLocation);
        }
      }
    }

    newLocations.push(newLocation);
    setLocations(newLocations);
    setUpdatedDays(newDays);
    setViewMode('list');
  };

  // Handle edit location
  const handleEditLocation = (updatedLocation: SavedLocation) => {
    let newLocations = [...locations];
    let newDays = [...updatedDays];

    const oldLocation = locations.find((loc) => loc.id === updatedLocation.id);

    // Update the location in the array
    newLocations = newLocations.map((loc) =>
      loc.id === updatedLocation.id ? updatedLocation : loc
    );

    // If setting as primary, remove primary flag from others
    if (updatedLocation.isPrimary && !oldLocation?.isPrimary) {
      const oldPrimary = newLocations.find(
        (loc) => loc.isPrimary && loc.id !== updatedLocation.id
      );
      newLocations = newLocations.map((loc) =>
        loc.id === updatedLocation.id ? loc : { ...loc, isPrimary: false }
      );

      // Update auto-filled items
      if (oldPrimary) {
        const confirmed = confirm(
          t('changePrimaryWarning', {
            oldName: oldPrimary.name,
            newName: updatedLocation.name,
          })
        );
        if (confirmed) {
          newDays = updateAutoFilledItems(newDays, oldPrimary.id, updatedLocation);
        }
      } else {
        // No old primary, auto-fill all days
        const confirmed = confirm(
          'This will add check-in/check-out to all days. Continue?'
        );
        if (confirmed) {
          newDays = autoFillAllDays(newDays, updatedLocation);
        }
      }
    } else if (updatedLocation.isPrimary && oldLocation?.isPrimary) {
      // Primary location edited (name, address, etc.), update auto-filled items
      newDays = updateAutoFilledItems(newDays, oldLocation.id, updatedLocation);
    }

    setLocations(newLocations);
    setUpdatedDays(newDays);
    setEditingLocation(undefined);
    setViewMode('list');
  };

  // Handle delete location
  const handleDeleteLocation = (locationId: string) => {
    const location = locations.find((loc) => loc.id === locationId);
    if (!location) return;

    // Check if it's primary and has auto-filled items
    if (location.isPrimary) {
      const count = countAutoFilledItems(updatedDays, locationId);
      if (count > 0) {
        const confirmed = confirm(
          t('deletePrimaryWarning', { count: count.toString() })
        );
        if (!confirmed) return;
      }
    } else {
      const confirmed = confirm(t('confirmDeleteLocation'));
      if (!confirmed) return;
    }

    // Remove location and its auto-filled items
    const newLocations = locations.filter((loc) => loc.id !== locationId);
    const newDays = removeAutoFilledItems(updatedDays, locationId);

    setLocations(newLocations);
    setUpdatedDays(newDays);
  };

  // Handle set as primary
  const handleSetPrimary = (locationId: string) => {
    const newLocation = locations.find((loc) => loc.id === locationId);
    if (!newLocation) return;

    let newLocations = [...locations];
    let newDays = [...updatedDays];

    const oldPrimary = newLocations.find((loc) => loc.isPrimary);

    // Set new primary
    newLocations = newLocations.map((loc) => ({
      ...loc,
      isPrimary: loc.id === locationId,
    }));

    // Update auto-filled items
    if (oldPrimary) {
      const confirmed = confirm(
        t('changePrimaryWarning', {
          oldName: oldPrimary.name,
          newName: newLocation.name,
        })
      );
      if (confirmed) {
        newDays = updateAutoFilledItems(newDays, oldPrimary.id, {
          ...newLocation,
          isPrimary: true,
        });
      } else {
        return; // User cancelled
      }
    } else {
      // No old primary, auto-fill all days
      const confirmed = confirm(
        'This will add check-in/check-out to all days. Continue?'
      );
      if (confirmed) {
        newDays = autoFillAllDays(newDays, { ...newLocation, isPrimary: true });
      } else {
        return; // User cancelled
      }
    }

    setLocations(newLocations);
    setUpdatedDays(newDays);
  };

  // Handle save and close
  const handleSaveAndClose = () => {
    onSave(locations, updatedDays);
    onClose();
  };

  // Handle cancel
  const handleCancel = () => {
    setLocations(initialLocations);
    setUpdatedDays(days);
    setViewMode('list');
    setEditingLocation(undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {viewMode === 'list' && t('manageSavedLocations')}
              {viewMode === 'add' && t('addNewLocation')}
              {viewMode === 'edit' && t('editLocation')}
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {viewMode === 'list' && (
            <>
              <SavedLocationsList
                savedLocations={locations}
                onEdit={(loc) => {
                  setEditingLocation(loc);
                  setViewMode('edit');
                }}
                onDelete={handleDeleteLocation}
                onSetPrimary={handleSetPrimary}
              />
              <button
                onClick={() => setViewMode('add')}
                className="w-full mt-4 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
              >
                + {t('addNewLocation')}
              </button>
            </>
          )}

          {viewMode === 'add' && (
            <SavedLocationForm
              cityBounds={cityBounds}
              onSubmit={handleAddLocation}
              onCancel={() => setViewMode('list')}
            />
          )}

          {viewMode === 'edit' && editingLocation && (
            <SavedLocationForm
              initialData={editingLocation}
              cityBounds={cityBounds}
              onSubmit={handleEditLocation}
              onCancel={() => {
                setEditingLocation(undefined);
                setViewMode('list');
              }}
            />
          )}
        </div>

        {/* Footer (only show in list view) */}
        {viewMode === 'list' && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSaveAndClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                {t('saveAndClose')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
