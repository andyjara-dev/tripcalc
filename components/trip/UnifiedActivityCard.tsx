'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { ItineraryItem, GeoLocation } from '@/lib/types/itinerary';
import type { SavedLocation } from '@/lib/types/saved-location';
import type { CityBounds } from '@/lib/services/geocoding';

interface UnifiedActivityCardProps {
  item: ItineraryItem;
  number: number;
  currencySymbol: string;
  isPremium: boolean;
  isDraggable?: boolean;
  cityBounds?: CityBounds;
  savedLocations?: SavedLocation[];
  onUpdate: (updates: Partial<ItineraryItem>) => void;
  onDelete: () => void;
  isHighlighted?: boolean;
  onRequestMapPick?: () => void;
}

const categoryIcons: Record<string, string> = {
  ACCOMMODATION: '🏨',
  FOOD: '🍽️',
  TRANSPORT: '🚕',
  ACTIVITIES: '🎭',
  SHOPPING: '🛍️',
  OTHER: '📝',
};

export default function UnifiedActivityCard({
  item,
  number,
  currencySymbol,
  isPremium,
  isDraggable = false,
  cityBounds,
  savedLocations = [],
  onUpdate,
  onDelete,
  isHighlighted = false,
  onRequestMapPick,
}: UnifiedActivityCardProps) {
  const t = useTranslations('unifiedView');
  const tActivity = useTranslations('activity');
  const [isExpanded, setIsExpanded] = useState(false);

  // Items con startTime no se reordenan en same-day (el tiempo los ordena)
  const isSortDisabled = !isDraggable || (isPremium && !!item.timeSlot?.startTime);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    disabled: isSortDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    onUpdate({
      timeSlot: {
        ...item.timeSlot,
        [field]: value,
      },
    });
  };

  const handleManualUpdate = (updates: Partial<ItineraryItem>) => {
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

  const handleSavedLocationSelect = (location: GeoLocation, locationName: string) => {
    onUpdate({
      location,
      name: item.name || locationName,
    });
  };

  const costDisplay = (item.amount * item.visits / 100).toFixed(2);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      id={`activity-${item.id}`}
      className={`bg-white border-2 rounded-lg p-4 shadow-sm transition-all ${
        isDragging
          ? 'opacity-40 scale-95 border-blue-400'
          : isHighlighted
          ? 'border-blue-500 ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Main row: drag handle, number, name, category, cost, actions */}
      <div className="flex items-center gap-3">
        {/* Drag handle */}
        {isDraggable && !isSortDisabled ? (
          <div
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0 touch-none p-1 -ml-1"
          >
            <GripVertical size={18} />
          </div>
        ) : isDraggable ? (
          <div className="flex-shrink-0 p-1 -ml-1 text-gray-200" title="Reorder disabled (time-based order)">
            <GripVertical size={18} />
          </div>
        ) : null}

        {/* Number badge */}
        <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
          {number}
        </div>

        {/* Time (premium) */}
        {isPremium ? (
          <input
            type="time"
            value={item.timeSlot?.startTime || ''}
            onChange={(e) => handleTimeChange('startTime', e.target.value)}
            className="w-[5.5rem] px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0"
          />
        ) : (
          <div className="relative flex-shrink-0">
            <input
              type="time"
              value=""
              disabled
              className="w-[5.5rem] px-2 py-1 text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded cursor-not-allowed"
              title={t('premiumFeature')}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-gray-400">🔒</span>
            </div>
          </div>
        )}

        {/* Activity name */}
        <input
          type="text"
          value={item.name}
          onChange={(e) => handleManualUpdate({ name: e.target.value })}
          className="flex-1 min-w-0 px-3 py-1 font-medium text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={tActivity('activityName')}
        />

        {/* Category icon */}
        <span className="text-xl flex-shrink-0">{categoryIcons[item.category] || '📝'}</span>

        {/* Cost */}
        <span className="font-semibold text-gray-900 text-sm flex-shrink-0 whitespace-nowrap">
          {currencySymbol}{costDisplay}
        </span>

        {/* Expand/Collapse */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-1.5 py-1 text-gray-500 hover:text-gray-900 text-sm flex-shrink-0"
        >
          {isExpanded ? '▼' : '▶'}
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          className="px-1.5 py-1 text-red-500 hover:text-red-700 text-sm flex-shrink-0"
        >
          ×
        </button>
      </div>

      {/* Quick info badges */}
      <div className="flex items-center gap-2 mt-2 ml-10 flex-wrap">
        {item.isBaseEstimate && (
          <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded uppercase">
            {t('baseEstimate')}
          </span>
        )}
        {item.isAutoFilled && (
          <span className="text-xs font-medium bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">
            🤖 Auto
          </span>
        )}
        {item.location && (
          <span className="text-xs text-green-600">📍 {item.location.address.substring(0, 30)}{item.location.address.length > 30 ? '...' : ''}</span>
        )}
        {item.timeSlot?.endTime && (
          <span className="text-xs text-gray-500">→ {item.timeSlot.endTime}</span>
        )}
        {item.bookingRequired && (
          <span className="text-xs text-orange-600 font-medium">🎫 Booking</span>
        )}
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4 ml-10">
          {/* Cost & Visits row */}
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
              onChange={(e) => onUpdate({ category: e.target.value as ItineraryItem['category'] })}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ACCOMMODATION">{categoryIcons.ACCOMMODATION} {tActivity('accommodation')}</option>
              <option value="FOOD">{categoryIcons.FOOD} {tActivity('food')}</option>
              <option value="TRANSPORT">{categoryIcons.TRANSPORT} {tActivity('transport')}</option>
              <option value="ACTIVITIES">{categoryIcons.ACTIVITIES} {tActivity('activities')}</option>
              <option value="SHOPPING">{categoryIcons.SHOPPING} {tActivity('shopping')}</option>
              <option value="OTHER">{categoryIcons.OTHER} {tActivity('other')}</option>
            </select>
          </div>

          {/* Premium: End time */}
          {isPremium ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {tActivity('endTime')}
              </label>
              <input
                type="time"
                value={item.timeSlot?.endTime || ''}
                onChange={(e) => handleTimeChange('endTime', e.target.value)}
                className="w-32 px-2 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ) : (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {tActivity('endTime')} 🔒
              </label>
              <input
                type="time"
                disabled
                className="w-32 px-2 py-2 text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">{t('unlockTimeline')}</p>
            </div>
          )}

          {/* Premium: Location */}
          {isPremium ? (
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
                    <span>Pick from Map</span>
                  </button>
                )}
              </div>
              <LocationSection
                item={item}
                cityBounds={cityBounds}
                savedLocations={savedLocations}
                onUpdate={handleManualUpdate}
                onSavedLocationSelect={handleSavedLocationSelect}
              />
            </div>
          ) : (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {tActivity('location')} 🔒
              </label>
              <input
                type="text"
                disabled
                placeholder={tActivity('enterAddress')}
                className="w-full px-3 py-2 text-gray-400 bg-gray-50 border border-gray-200 rounded cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">{t('unlockDescription')}</p>
            </div>
          )}

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

          {/* Premium: Booking */}
          {isPremium && (
            <>
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
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Separate component to lazy-load location features
function LocationSection({
  item,
  cityBounds,
  savedLocations,
  onUpdate,
  onSavedLocationSelect,
}: {
  item: ItineraryItem;
  cityBounds?: CityBounds;
  savedLocations: SavedLocation[];
  onUpdate: (updates: Partial<ItineraryItem>) => void;
  onSavedLocationSelect: (location: GeoLocation, name: string) => void;
}) {
  // Dynamically import to avoid loading geocoding code for non-premium
  const [LocationAutocomplete, setLocationAutocomplete] = useState<React.ComponentType<any> | null>(null);
  const [SavedLocationPicker, setSavedLocationPicker] = useState<React.ComponentType<any> | null>(null);
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
    // Lazy load on first render
    Promise.all([
      import('../itinerary/LocationAutocomplete'),
      import('../itinerary/SavedLocationPicker'),
    ]).then(([locMod, savedMod]) => {
      setLocationAutocomplete(() => locMod.default);
      setSavedLocationPicker(() => savedMod.default);
      setLoaded(true);
    });

    return (
      <input
        type="text"
        value={item.location?.address || ''}
        readOnly
        className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded"
        placeholder="Loading..."
      />
    );
  }

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        {LocationAutocomplete && (
          <LocationAutocomplete
            value={item.location}
            onChange={(location: GeoLocation | null) => onUpdate({ location: location || undefined })}
            cityBounds={cityBounds}
            placeholder="Enter address"
          />
        )}
      </div>
      {savedLocations.length > 0 && SavedLocationPicker && (
        <SavedLocationPicker
          savedLocations={savedLocations}
          currentLocation={item.location}
          onSelect={onSavedLocationSelect}
        />
      )}
    </div>
  );
}
