'use client';

/**
 * SavedLocationForm Component
 * Form to add/edit a saved location
 */

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { nanoid } from 'nanoid';
import type { SavedLocation, LocationCategory } from '@/lib/types/saved-location';
import type { GeoLocation } from '@/lib/types/itinerary';
import type { CityBounds } from '@/lib/services/geocoding';
import LocationAutocomplete from './LocationAutocomplete';

interface SavedLocationFormProps {
  initialData?: SavedLocation;
  cityBounds?: CityBounds;
  onSubmit: (location: SavedLocation) => void;
  onCancel: () => void;
}

export default function SavedLocationForm({
  initialData,
  cityBounds,
  onSubmit,
  onCancel,
}: SavedLocationFormProps) {
  const t = useTranslations('itinerary');

  // Form state
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState<LocationCategory>(
    initialData?.category || 'ACCOMMODATION'
  );
  const [location, setLocation] = useState<GeoLocation | undefined>(
    initialData?.location
  );
  const [isPrimary, setIsPrimary] = useState(initialData?.isPrimary || false);
  const [icon, setIcon] = useState(initialData?.icon || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation
  const isValid = name.trim().length > 0 && location !== undefined && location !== null;

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValid || !location) return;

    setIsSubmitting(true);

    const savedLocation: SavedLocation = {
      id: initialData?.id || nanoid(),
      name: name.trim(),
      category,
      location,
      isPrimary,
      icon: icon.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    onSubmit(savedLocation);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Location Name */}
      <div>
        <label
          htmlFor="location-name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {t('locationName')}
        </label>
        <input
          id="location-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Hotel Barceló, Favorite Café"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          maxLength={100}
          required
        />
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="location-category"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {t('locationCategory')}
        </label>
        <select
          id="location-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as LocationCategory)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
        >
          <option value="ACCOMMODATION">{t('categories.ACCOMMODATION')}</option>
          <option value="RESTAURANT">{t('categories.RESTAURANT')}</option>
          <option value="LANDMARK">{t('categories.LANDMARK')}</option>
          <option value="TRANSPORT_HUB">{t('categories.TRANSPORT_HUB')}</option>
          <option value="OTHER">{t('categories.OTHER')}</option>
        </select>
      </div>

      {/* Location (Address) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('location')}
        </label>
        <LocationAutocomplete
          value={location}
          onChange={setLocation}
          placeholder={t('enterAddress')}
          cityBounds={cityBounds}
        />
      </div>

      {/* Icon (optional) */}
      <div>
        <label
          htmlFor="location-icon"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Icon (optional)
        </label>
        <input
          id="location-icon"
          type="text"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="🏨 🍽️ 📍"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          maxLength={4}
        />
        <p className="text-xs text-gray-500 mt-1">
          Leave empty to use default category icon
        </p>
      </div>

      {/* Notes (optional) */}
      <div>
        <label
          htmlFor="location-notes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {t('notes')} (optional)
        </label>
        <textarea
          id="location-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g., Near metro station, ask for room with view"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          maxLength={500}
        />
      </div>

      {/* Primary Accommodation Checkbox */}
      <div className="flex items-center gap-2">
        <input
          id="is-primary"
          type="checkbox"
          checked={isPrimary}
          onChange={(e) => setIsPrimary(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="is-primary" className="text-sm text-gray-700">
          {t('makePrimary')} (auto-fill check-in/check-out on all days)
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Add'}
        </button>
      </div>
    </form>
  );
}
