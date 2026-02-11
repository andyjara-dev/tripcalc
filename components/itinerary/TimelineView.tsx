'use client';

/**
 * TimelineView Component
 * Vertical timeline layout with activity cards
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { nanoid } from 'nanoid';
import type { ItineraryItem } from '@/lib/types/itinerary';
import type { SavedLocation } from '@/lib/types/saved-location';
import { sortItemsByTime } from '@/lib/types/itinerary';
import type { CityBounds } from '@/lib/services/geocoding';
import ActivityCard from './ActivityCard';
import RoutingSegment from './RoutingSegment';

interface TimelineViewProps {
  items: ItineraryItem[];
  currencySymbol: string;
  cityBounds?: CityBounds;
  savedLocations?: SavedLocation[];
  onItemsChange: (items: ItineraryItem[]) => void;
  highlightedItemId?: string;
  onRequestMapPick?: (itemId: string) => void;
}

export default function TimelineView({
  items,
  currencySymbol,
  cityBounds,
  savedLocations = [],
  onItemsChange,
  highlightedItemId,
  onRequestMapPick,
}: TimelineViewProps) {
  const t = useTranslations('itinerary');
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Sort items by time
  const sortedItems = sortItemsByTime(items);

  // Add new activity
  const addActivity = (category: ItineraryItem['category']) => {
    const newItem: ItineraryItem = {
      id: nanoid(),
      name: '',
      category,
      amount: 0, // In cents
      visits: 1,
      isOneTime: false, // Deprecated but required for backward compatibility
      notes: '',
      // Itinerary-specific
      timeSlot: {
        startTime: undefined,
        endTime: undefined,
      },
      location: undefined,
      bookingRequired: false,
      bookingUrl: '',
      isAISuggestion: false,
    };

    onItemsChange([...items, newItem]);
    setShowAddMenu(false);
  };

  // Update activity
  const updateActivity = (id: string, updates: Partial<ItineraryItem>) => {
    onItemsChange(
      items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  };

  // Delete activity
  const deleteActivity = (id: string) => {
    if (confirm(t('confirmDeleteActivity'))) {
      onItemsChange(items.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('timeline')} ({sortedItems.length} {t('activities')})
        </h3>

        {/* Add Activity Button */}
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>+</span>
            <span>{t('addActivity')}</span>
          </button>

          {/* Category dropdown */}
          {showAddMenu && (
            <>
              {/* Backdrop to close menu */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowAddMenu(false)}
              />

              {/* Menu */}
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
                <div className="py-2">
                  <button
                    onClick={() => addActivity('FOOD')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-900"
                  >
                    <span className="text-xl">🍽️</span>
                    <span className="font-medium">{t('addMeal')}</span>
                  </button>
                  <button
                    onClick={() => addActivity('ACTIVITIES')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-900"
                  >
                    <span className="text-xl">🎭</span>
                    <span className="font-medium">{t('addAttraction')}</span>
                  </button>
                  <button
                    onClick={() => addActivity('TRANSPORT')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-900"
                  >
                    <span className="text-xl">🚕</span>
                    <span className="font-medium">{t('addTransport')}</span>
                  </button>
                  <button
                    onClick={() => addActivity('SHOPPING')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-900"
                  >
                    <span className="text-xl">🛍️</span>
                    <span className="font-medium">{t('addShopping')}</span>
                  </button>
                  <button
                    onClick={() => addActivity('OTHER')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-gray-900"
                  >
                    <span className="text-xl">📝</span>
                    <span className="font-medium">{t('addOther')}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Timeline */}
      {sortedItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📅</div>
          <p className="text-lg font-medium">{t('noActivitiesYet')}</p>
          <p className="text-sm mt-2">{t('clickAddActivityToStart')}</p>
        </div>
      ) : (
        <div className="relative">
          {sortedItems.map((item, index) => (
            <div key={item.id}>
              {/* Activity card */}
              <ActivityCard
                item={item}
                number={index + 1}
                currencySymbol={currencySymbol}
                cityBounds={cityBounds}
                savedLocations={savedLocations}
                onUpdate={(updates) => updateActivity(item.id, updates)}
                onDelete={() => deleteActivity(item.id)}
                isHighlighted={item.id === highlightedItemId}
                onRequestMapPick={onRequestMapPick ? () => onRequestMapPick(item.id) : undefined}
              />

              {/* Routing segment to next activity (if both have locations) */}
              {index < sortedItems.length - 1 && (
                <RoutingSegment
                  from={item}
                  to={sortedItems[index + 1]}
                />
              )}
            </div>
          ))}

          {/* End of timeline marker */}
          <div className="relative pl-12">
            <div className="absolute left-4 top-0 w-0.5 h-4 bg-gray-200" />
            <div className="absolute left-2 top-4 w-4 h-4 bg-gray-300 rounded-full" />
          </div>
        </div>
      )}

      {/* Summary */}
      {sortedItems.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              {t('totalDayCost')}:
            </span>
            <span className="text-lg font-bold text-gray-900">
              {currencySymbol}
              {(
                sortedItems.reduce(
                  (sum, item) => sum + (item.amount * item.visits) / 100,
                  0
                )
              ).toFixed(2)}
            </span>
          </div>

          <div className="mt-2 text-xs text-gray-600">
            {sortedItems.filter((item) => item.location).length}{' '}
            {t('withLocation')}, {sortedItems.filter((item) => item.timeSlot?.startTime).length}{' '}
            {t('withTime')}
          </div>
        </div>
      )}
    </div>
  );
}
