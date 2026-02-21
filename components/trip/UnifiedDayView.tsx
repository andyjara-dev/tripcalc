'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { nanoid } from 'nanoid';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { CityData } from '@/data/cities';
import type { DayPlan, ItemCategory } from '@/types/trip-planner';
import { calculateDayCost } from '@/types/trip-planner';
import type { ItineraryItem } from '@/lib/types/itinerary';
import { sortItemsByTime } from '@/lib/types/itinerary';
import type { SavedLocation } from '@/lib/types/saved-location';
import type { CityBounds } from '@/lib/services/geocoding';
import UnifiedActivityCard from './UnifiedActivityCard';
import RoutingSegment from '../itinerary/RoutingSegment';
import { BudgetBar } from './BudgetSummaryPanel';

interface UnifiedDayViewProps {
  day: DayPlan;
  city: CityData;
  costs: {
    accommodation: number;
    food: number;
    transport: number;
    activities: number;
  };
  currencySymbol: string;
  isPremium: boolean;
  totalDays: number;
  isDragContext?: boolean;
  savedLocations?: SavedLocation[];
  cityBounds?: CityBounds;
  onUpdate: (updates: Partial<DayPlan>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  highlightedItemId?: string;
  onRequestMapPick?: (itemId: string) => void;
}

export default function UnifiedDayView({
  day,
  city,
  costs,
  currencySymbol,
  isPremium,
  totalDays,
  isDragContext = false,
  savedLocations = [],
  cityBounds,
  onUpdate,
  onRemove,
  onDuplicate,
  highlightedItemId,
  onRequestMapPick,
}: UnifiedDayViewProps) {
  const t = useTranslations('unifiedView');
  const tCalc = useTranslations('calculator');
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `day-${day.dayNumber}`,
  });

  const items = day.customItems as ItineraryItem[];
  const sortedItems = isPremium ? sortItemsByTime(items) : items;

  const dayCost = calculateDayCost(day, costs);

  // Category toggles
  const toggleCategory = (category: keyof DayPlan['included']) => {
    onUpdate({
      included: {
        ...day.included,
        [category]: !day.included[category],
      },
    });
  };

  const toggleBase = (category: keyof DayPlan['includeBase']) => {
    onUpdate({
      includeBase: {
        ...day.includeBase,
        [category]: !day.includeBase[category],
      },
    });
  };

  // Add new activity
  const addActivity = (category: ItemCategory) => {
    const newItem: ItineraryItem = {
      id: nanoid(),
      name: '',
      category,
      amount: 0,
      visits: 1,
      isOneTime: false,
      notes: '',
      timeSlot: isPremium ? { startTime: undefined, endTime: undefined } : undefined,
      location: undefined,
      bookingRequired: false,
    };

    onUpdate({
      customItems: [...day.customItems, newItem],
    });
    setShowAddMenu(false);
  };

  // Update activity
  const updateActivity = (id: string, updates: Partial<ItineraryItem>) => {
    onUpdate({
      customItems: day.customItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  // Delete activity
  const deleteActivity = (id: string) => {
    if (confirm(t('confirmDelete'))) {
      onUpdate({
        customItems: day.customItems.filter((item) => item.id !== id),
      });
    }
  };

  // Category sections config
  const categories = [
    { key: 'accommodation' as const, category: 'ACCOMMODATION' as const, icon: '🏨' },
    { key: 'food' as const, category: 'FOOD' as const, icon: '🍽️' },
    { key: 'transport' as const, category: 'TRANSPORT' as const, icon: '🚇' },
    { key: 'activities' as const, category: 'ACTIVITIES' as const, icon: '🎭' },
  ];

  return (
    <div className="space-y-4">
      {/* Day Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold text-gray-900">
              {day.date || `Day ${day.dayNumber}`}
            </h3>
            {!day.date && (
              <button
                onClick={() => setIsEditingDate(true)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add date
              </button>
            )}
          </div>

          {(day.date || isEditingDate) && (
            <div className="flex items-center gap-2 mb-2">
              <input
                type="date"
                value={day.date || ''}
                onChange={e => onUpdate({ date: e.target.value || undefined })}
                className="px-3 py-1 border border-gray-300 rounded text-sm bg-white text-gray-900"
              />
              {day.date && (
                <button
                  onClick={() => {
                    onUpdate({ date: undefined });
                    setIsEditingDate(false);
                  }}
                  className="text-sm text-gray-600 hover:text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          )}

          <input
            type="text"
            placeholder="Day name (optional) - e.g., Arrival, Museums, Departure"
            value={day.dayName || ''}
            onChange={e => onUpdate({ dayName: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 placeholder:text-gray-400 text-sm"
          />
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={onDuplicate}
            className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded"
            title="Duplicate this day"
          >
            📋 Copy
          </button>
          {totalDays > 1 && (
            <button
              onClick={onRemove}
              className="px-3 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded"
            >
              × Remove
            </button>
          )}
        </div>
      </div>

      {/* Mobile Budget Bar */}
      <div className="lg:hidden bg-gray-50 rounded-lg p-3">
        <BudgetBar
          items={items}
          baseCosts={costs}
          includeBase={day.includeBase}
          included={day.included}
          currencySymbol={currencySymbol}
        />
      </div>

      {/* Category Toggles (compact) */}
      <div className="flex flex-wrap gap-2">
        {categories.map(({ key, icon }) => {
          const isIncluded = day.included[key];
          return (
            <button
              key={key}
              onClick={() => toggleCategory(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                isIncluded
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-400 line-through'
              }`}
            >
              <span>{icon}</span>
              <span>{tCalc(key)}</span>
            </button>
          );
        })}
      </div>

      {/* Base Estimates */}
      <div className="space-y-1.5">
        {categories.map(({ key, category, icon }) => {
          if (!day.included[key]) return null;
          const hasBase = day.includeBase[key];
          const baseCost = costs[key];

          if (!hasBase) {
            return (
              <button
                key={`base-${key}`}
                onClick={() => toggleBase(key)}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>+</span>
                <span>{tCalc('customItems.addBackBase')} {icon} ({currencySymbol}{baseCost.toFixed(0)})</span>
              </button>
            );
          }

          return (
            <div key={`base-${key}`} className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded uppercase">
                  {t('baseEstimate')}
                </span>
                <span>{icon}</span>
                <span className="font-medium text-gray-900">{tCalc(key)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">
                  {currencySymbol}{baseCost.toFixed(0)}
                </span>
                <button
                  onClick={() => toggleBase(key)}
                  className="text-gray-600 hover:text-red-600 text-lg leading-none px-1 font-bold"
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Cards */}
      <SortableContext items={sortedItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setDropRef}
          className={`transition-all rounded-lg ${
            isOver && isDragContext ? 'bg-blue-50 ring-2 ring-blue-300 ring-dashed p-2' : ''
          }`}
        >
          {sortedItems.length === 0 ? (
            <div className={`text-center py-8 ${isOver && isDragContext ? 'text-blue-500' : 'text-gray-500'}`}>
              {isOver && isDragContext ? (
                <>
                  <div className="text-3xl mb-2">📥</div>
                  <p className="font-medium text-blue-700">Drop here</p>
                </>
              ) : (
                <>
                  <div className="text-3xl mb-2">📝</div>
                  <p className="font-medium text-gray-900">{t('emptyDay')}</p>
                  <p className="text-sm mt-1">{t('emptyDayHint')}</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {sortedItems.map((item, index) => (
                <div key={item.id}>
                  <UnifiedActivityCard
                    item={item}
                    number={index + 1}
                    currencySymbol={currencySymbol}
                    isPremium={isPremium}
                    isDraggable={isDragContext}
                    cityBounds={cityBounds}
                    savedLocations={savedLocations}
                    onUpdate={(updates) => updateActivity(item.id, updates)}
                    onDelete={() => deleteActivity(item.id)}
                    isHighlighted={item.id === highlightedItemId}
                    onRequestMapPick={onRequestMapPick ? () => onRequestMapPick(item.id) : undefined}
                  />
                  {/* Routing segment between consecutive activities (premium only) */}
                  {isPremium && index < sortedItems.length - 1 && (
                    <RoutingSegment
                      from={item}
                      to={sortedItems[index + 1]}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </SortableContext>

      {/* Add Activity Button */}
      <div className="relative">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <span>+</span>
          <span>{t('addActivity')}</span>
        </button>

        {showAddMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowAddMenu(false)}
            />
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
              <div className="py-2 grid grid-cols-2 gap-1 px-2">
                {[
                  { cat: 'ACCOMMODATION' as const, icon: '🏨', label: t('addAccommodation') },
                  { cat: 'FOOD' as const, icon: '🍽️', label: t('addMeal') },
                  { cat: 'TRANSPORT' as const, icon: '🚕', label: t('addTransport') },
                  { cat: 'ACTIVITIES' as const, icon: '🎭', label: t('addAttraction') },
                  { cat: 'SHOPPING' as const, icon: '🛍️', label: t('addShopping') },
                  { cat: 'OTHER' as const, icon: '📝', label: t('addOther') },
                ].map(({ cat, icon, label }) => (
                  <button
                    key={cat}
                    onClick={() => addActivity(cat)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 rounded flex items-center gap-2 text-gray-900 text-sm"
                  >
                    <span className="text-lg">{icon}</span>
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Day Total */}
      <div className="bg-gray-100 rounded-lg p-4 flex justify-between items-center">
        <span className="text-lg font-medium text-gray-700">{t('dayTotal')}:</span>
        <span className="text-2xl font-bold text-gray-900">
          {currencySymbol}{dayCost.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
