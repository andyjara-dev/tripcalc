'use client';

/**
 * ActivityCard Component
 * Displays an activity in the timeline with inline editing
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ItineraryItem, GeoLocation } from '@/lib/types/itinerary';
import type { SavedLocation } from '@/lib/types/saved-location';
import type { CityBounds } from '@/lib/services/geocoding';
import LocationAutocomplete from './LocationAutocomplete';
import SavedLocationPicker from './SavedLocationPicker';

interface ActivityCardProps {
  item: ItineraryItem;
  number: number; // Position in timeline
  currencySymbol: string;
  cityBounds?: CityBounds;
  savedLocations?: SavedLocation[]; // Saved locations for quick picker
  onUpdate: (updates: Partial<ItineraryItem>) => void;
  onDelete: () => void;
  isHighlighted?: boolean;
  onRequestMapPick?: () => void; // Request to pick location from map
}

export default function ActivityCard({
  item,
  number,
  currencySymbol,
  cityBounds,
  savedLocations = [],
  onUpdate,
  onDelete,
  isHighlighted = false,
  onRequestMapPick,
}: ActivityCardProps) {
  const t = useTranslations('itinerary');
  const tActivity = useTranslations('activity');
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle saved location selection
  const handleSavedLocationSelect = (location: GeoLocation, locationName: string) => {
    onUpdate({
      location,
      // Optionally update name if it's empty
      name: item.name || locationName,
    });
  };

  // Handle manual edit - remove auto-fill flags when user manually edits
  const handleManualUpdate = (updates: Partial<ItineraryItem>) => {
    // If this item is auto-filled and user is manually editing it,
    // remove auto-fill flags so it won't be overwritten
    if (item.isAutoFilled && (updates.name || updates.location)) {
      onUpdate({
        ...updates,
        isAutoFilled: false,
        autoFillSource: undefined,
      });
    } else {
      onUpdate(updates);
    }
  };

  // Category icons
  const categoryIcons = {
    ACCOMMODATION: '🏨',
    FOOD: '🍽️',
    TRANSPORT: '🚕',
    ACTIVITIES: '🎭',
    SHOPPING: '🛍️',
    OTHER: '📝',
  };

  // Time handling
  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    onUpdate({
      timeSlot: {
        ...item.timeSlot,
        [field]: value,
      },
    });
  };

  return (
    <div
      className={`relative pl-12 pb-8 ${
        isHighlighted ? 'ring-2 ring-blue-500 rounded-lg' : ''
      }`}
    >
      {/* Timeline connector line */}
      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200" />

      {/* Timeline circle/number */}
      <div className="absolute left-0 top-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
        {number}
      </div>

      {/* Card content */}
      <div className={`bg-white border-2 rounded-lg p-4 shadow-sm transition-all ${
        isHighlighted ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
      }`}>
        {/* Header row: Time + Name + Actions */}
        <div className="flex items-start gap-3 mb-3">
          {/* Start time */}
          <input
            type="time"
            value={item.timeSlot?.startTime || ''}
            onChange={(e) => handleTimeChange('startTime', e.target.value)}
            className="w-24 px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="HH:MM"
          />

          {/* Activity name */}
          <input
            type="text"
            value={item.name}
            onChange={(e) => handleManualUpdate({ name: e.target.value })}
            className="flex-1 px-3 py-1 font-medium text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={tActivity('activityName')}
          />

          {/* Category icon */}
          <span className="text-2xl">{categoryIcons[item.category]}</span>

          {/* Expand/Collapse button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2 py-1 text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            {isExpanded ? '▼' : '▶'}
          </button>

          {/* Delete button */}
          <button
            onClick={onDelete}
            className="px-2 py-1 text-red-600 hover:text-red-700 text-sm font-medium"
            title={t('deleteActivity')}
          >
            🗑️
          </button>
        </div>

        {/* Quick info (always visible) */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
          {item.timeSlot?.endTime && (
            <span>→ {item.timeSlot.endTime}</span>
          )}
          <span>
            {currencySymbol}{(item.amount * item.visits / 100).toFixed(2)}
          </span>
          {item.location && (
            <span className="text-green-600">📍</span>
          )}
          {item.isAutoFilled && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
              🤖 {t('autoFilled')}
            </span>
          )}
        </div>

        {/* Expanded details */}
        {isExpanded && (
          <div className="mt-4 space-y-4 pt-4 border-t border-gray-200">
            {/* End time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {tActivity('endTime')}
              </label>
              <input
                type="time"
                value={item.timeSlot?.endTime || ''}
                onChange={(e) => handleTimeChange('endTime', e.target.value)}
                className="w-32 px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="HH:MM"
              />
            </div>

            {/* Location */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  {tActivity('location')}
                </label>
                {onRequestMapPick && (
                  <button
                    type="button"
                    onClick={onRequestMapPick}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>📍</span>
                    <span>{t('pickFromMap')}</span>
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <LocationAutocomplete
                    value={item.location}
                    onChange={(location) => handleManualUpdate({ location: location || undefined })}
                    cityBounds={cityBounds}
                    placeholder={tActivity('enterAddress')}
                  />
                </div>
                {savedLocations.length > 0 && (
                  <SavedLocationPicker
                    savedLocations={savedLocations}
                    currentLocation={item.location}
                    onSelect={handleSavedLocationSelect}
                  />
                )}
              </div>
            </div>

            {/* Cost */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {tActivity('cost')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    value={(item.amount / 100).toFixed(2)}
                    onChange={(e) => {
                      const cents = Math.round(parseFloat(e.target.value || '0') * 100);
                      onUpdate({ amount: cents });
                    }}
                    className="w-full pl-8 pr-3 py-2 text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {tActivity('visits')}
                </label>
                <input
                  type="number"
                  value={item.visits}
                  onChange={(e) => onUpdate({ visits: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {tActivity('category')}
              </label>
              <select
                value={item.category}
                onChange={(e) => onUpdate({ category: e.target.value as any })}
                className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="FOOD">{categoryIcons.FOOD} {tActivity('food')}</option>
                <option value="ACTIVITIES">{categoryIcons.ACTIVITIES} {tActivity('activities')}</option>
                <option value="TRANSPORT">{categoryIcons.TRANSPORT} {tActivity('transport')}</option>
                <option value="ACCOMMODATION">{categoryIcons.ACCOMMODATION} {tActivity('accommodation')}</option>
                <option value="SHOPPING">{categoryIcons.SHOPPING} {tActivity('shopping')}</option>
                <option value="OTHER">{categoryIcons.OTHER} {tActivity('other')}</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {tActivity('notes')}
              </label>
              <textarea
                value={item.notes || ''}
                onChange={(e) => onUpdate({ notes: e.target.value })}
                className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
                placeholder={tActivity('addNotes')}
              />
            </div>

            {/* Booking */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.bookingRequired || false}
                onChange={(e) => onUpdate({ bookingRequired: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                id={`booking-${item.id}`}
              />
              <label htmlFor={`booking-${item.id}`} className="text-sm text-gray-700">
                {tActivity('bookingRequired')}
              </label>
            </div>

            {item.bookingRequired && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {tActivity('bookingUrl')}
                </label>
                <input
                  type="url"
                  value={item.bookingUrl || ''}
                  onChange={(e) => onUpdate({ bookingUrl: e.target.value })}
                  className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
              </div>
            )}

            {/* AI Suggestion badge */}
            {item.isAISuggestion && (
              <div className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded inline-block">
                ✨ {t('aiSuggestion')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
