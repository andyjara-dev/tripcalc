'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { DayPlan } from '@/types/trip-planner';
import { calculateDayCost } from '@/types/trip-planner';
import type { ItineraryItem } from '@/lib/types/itinerary';
import type { CityData } from '@/data/cities';
import type { SavedLocation } from '@/lib/types/saved-location';
import UnifiedDayView from '../trip/UnifiedDayView';
import MapPanel from '../itinerary/MapPanel';
import MapPremiumTeaser from '../premium/MapPremiumTeaser';
import BudgetSummaryPanel from '../trip/BudgetSummaryPanel';
import { formatDayDateShort } from '@/lib/utils/format-day-date';

// --- DroppableDayTab ---

function DroppableDayTab({
  day,
  isActive,
  currencySymbol,
  locale,
  costs,
  onClick,
}: {
  day: DayPlan;
  isActive: boolean;
  currencySymbol: string;
  locale: string;
  costs: { accommodation: number; food: number; transport: number; activities: number };
  onClick: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `tab-${day.dayNumber}` });
  const dayCost = calculateDayCost(day, costs);

  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      className={`px-4 py-3 rounded-lg flex-shrink-0 transition-all w-[110px] ${
        isOver
          ? 'bg-blue-100 border-2 border-blue-400 scale-105 shadow-md'
          : isActive
          ? 'bg-gray-900 text-white shadow-lg'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
      }`}
    >
      <div className={`font-semibold text-sm truncate ${isOver ? 'text-blue-900' : ''}`}>
        {day.date ? formatDayDateShort(day.date, locale) : `Day ${day.dayNumber}`}
      </div>
      {day.dayName && (
        <div className={`text-xs mt-0.5 truncate ${
          isOver ? 'text-blue-700' : isActive ? 'text-gray-300' : 'text-gray-500'
        }`}>
          {day.dayName}
        </div>
      )}
      <div className={`text-xs mt-0.5 ${
        isOver ? 'text-blue-700' : isActive ? 'text-gray-300' : 'text-gray-600'
      }`}>
        {currencySymbol}{dayCost.toFixed(0)}
      </div>
    </button>
  );
}

// --- DragOverlayCard ---

function DragOverlayCard({
  item,
  currencySymbol,
}: {
  item: ItineraryItem;
  currencySymbol: string;
}) {
  const categoryIcons: Record<string, string> = {
    ACCOMMODATION: '🏨',
    FOOD: '🍽️',
    TRANSPORT: '🚕',
    ACTIVITIES: '🎭',
    SHOPPING: '🛍️',
    OTHER: '📝',
  };
  const cost = (item.amount * item.visits / 100).toFixed(2);

  return (
    <div className="bg-white border-2 border-blue-400 rounded-lg p-4 shadow-2xl opacity-90 cursor-grabbing max-w-sm">
      <div className="flex items-center gap-3">
        <span className="text-xl">{categoryIcons[item.category] || '📝'}</span>
        <span className="font-medium text-gray-900 flex-1 truncate">{item.name || '…'}</span>
        <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
          {currencySymbol}{cost}
        </span>
      </div>
    </div>
  );
}

// --- Props interface ---

export interface DayPlanningSectionProps {
  days: DayPlan[];
  setDays: React.Dispatch<React.SetStateAction<DayPlan[]>>;
  activeDay: number;
  setActiveDay: React.Dispatch<React.SetStateAction<number>>;
  city: CityData;
  costs: { accommodation: number; food: number; transport: number; activities: number };
  locale: string;
  isPremium: boolean;
  savedLocations: SavedLocation[];
  highlightedItemId?: string;
  pickingItemId?: string;
  setPickingItemId: (id: string | undefined) => void;
  isReverseGeocoding: boolean;
  onAddDay: () => void;
  onUpdateDay: (dayNumber: number, updates: Partial<DayPlan>) => void;
  onRemoveDay: (dayNumber: number) => void;
  onDuplicateDay: (dayNumber: number) => void;
  onRequestMapPick?: (itemId: string) => void;
  onMarkerClick: (itemId: string) => void;
  onMapClick: (lat: number, lon: number) => Promise<void>;
  onShowSavedLocations: () => void;
}

// --- Main component ---

export default function DayPlanningSection({
  days,
  setDays,
  activeDay,
  setActiveDay,
  city,
  costs,
  locale,
  isPremium,
  savedLocations,
  highlightedItemId,
  pickingItemId,
  setPickingItemId,
  isReverseGeocoding,
  onAddDay,
  onUpdateDay,
  onRemoveDay,
  onDuplicateDay,
  onRequestMapPick,
  onMarkerClick,
  onMapClick,
  onShowSavedLocations,
}: DayPlanningSectionProps) {
  const tTrips = useTranslations('trips');

  const [activeItem, setActiveItem] = useState<ItineraryItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    for (const day of days) {
      const found = (day.customItems as ItineraryItem[]).find(i => i.id === event.active.id);
      if (found) { setActiveItem(found); break; }
    }
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Visual feedback is handled by useDroppable in DroppableDayTab and useDroppable in UnifiedDayView
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const sourceDayIdx = days.findIndex(d =>
      (d.customItems as ItineraryItem[]).some(i => i.id === activeId)
    );
    if (sourceDayIdx === -1) return;
    const sourceDay = days[sourceDayIdx];

    // Determine target day number
    let targetDayNumber: number;
    if (overId.startsWith('tab-')) {
      targetDayNumber = parseInt(overId.replace('tab-', ''), 10);
    } else if (overId.startsWith('day-')) {
      targetDayNumber = parseInt(overId.replace('day-', ''), 10);
    } else {
      // over.id is an item id — find which day it belongs to
      targetDayNumber = sourceDay.dayNumber;
      for (const day of days) {
        if ((day.customItems as ItineraryItem[]).some(i => i.id === overId)) {
          targetDayNumber = day.dayNumber;
          break;
        }
      }
    }

    const targetDayIdx = days.findIndex(d => d.dayNumber === targetDayNumber);
    if (targetDayIdx === -1) return;

    if (sourceDayIdx === targetDayIdx) {
      // Same-day reorder
      const currentItems = [...(sourceDay.customItems as ItineraryItem[])];
      const oldIndex = currentItems.findIndex(i => i.id === activeId);
      const newIndex = currentItems.findIndex(i => i.id === overId);
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
      const reordered = arrayMove(currentItems, oldIndex, newIndex);
      setDays(days.map(d =>
        d.dayNumber === sourceDay.dayNumber ? { ...d, customItems: reordered } : d
      ));
    } else {
      // Cross-day move — preserves all item properties
      const itemToMove = (sourceDay.customItems as ItineraryItem[]).find(i => i.id === activeId);
      if (!itemToMove) return;
      const itemCopy = { ...itemToMove };
      setDays(days.map(d => {
        if (d.dayNumber === sourceDay.dayNumber) {
          return { ...d, customItems: (d.customItems as ItineraryItem[]).filter(i => i.id !== activeId) };
        }
        if (d.dayNumber === targetDayNumber) {
          return { ...d, customItems: [...(d.customItems as ItineraryItem[]), itemCopy] };
        }
        return d;
      }));
      setActiveDay(targetDayNumber);
    }
  };

  const activeD = days.find(d => d.dayNumber === activeDay);
  const cityBounds = {
    north: city.latitude + 0.1,
    south: city.latitude - 0.1,
    east: city.longitude + 0.1,
    west: city.longitude - 0.1,
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="mt-4 space-y-4">
        {/* Day Tabs — cada tab es un drop zone */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {days.map(day => (
            <DroppableDayTab
              key={day.dayNumber}
              day={day}
              isActive={activeDay === day.dayNumber}
              currencySymbol={city.currencySymbol}
              locale={locale}
              costs={costs}
              onClick={() => setActiveDay(day.dayNumber)}
            />
          ))}
          {days.length < 30 && (
            <button
              onClick={onAddDay}
              className="px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex-shrink-0 font-semibold text-sm"
            >
              + Add Day
            </button>
          )}
        </div>

        {/* Unified Day View: Activities + Map/Budget sidebar */}
        {activeD && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Activities (2/3 width on desktop) */}
            <div className="lg:col-span-2">
              <UnifiedDayView
                day={activeD}
                city={city}
                costs={costs}
                currencySymbol={city.currencySymbol}
                isPremium={isPremium}
                totalDays={days.length}
                isDragContext={true}
                savedLocations={savedLocations}
                cityBounds={cityBounds}
                onUpdate={updates => onUpdateDay(activeD.dayNumber, updates)}
                onRemove={() => onRemoveDay(activeD.dayNumber)}
                onDuplicate={() => onDuplicateDay(activeD.dayNumber)}
                highlightedItemId={highlightedItemId}
                onRequestMapPick={isPremium ? onRequestMapPick : undefined}
              />
            </div>

            {/* Right: Map + Budget Summary (1/3 width on desktop) */}
            <div className="relative z-0 lg:sticky lg:top-4 lg:self-start space-y-4">
              <div id="itinerary-map">
                {isPremium ? (
                  <>
                    <button
                      onClick={onShowSavedLocations}
                      className="w-full mb-3 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <span>📍</span>
                      <span>{tTrips('manageSavedLocations')}</span>
                      {savedLocations.length > 0 && (
                        <span className="text-xs px-2 py-0.5 bg-blue-200 text-blue-800 rounded-full font-medium">
                          {savedLocations.length}
                        </span>
                      )}
                    </button>

                    {pickingItemId && (
                      <div className="mb-3 p-3 bg-blue-600 text-white rounded-lg shadow-lg animate-pulse text-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>👇</span>
                            <span className="font-bold">Click on the map</span>
                          </div>
                          <button
                            onClick={() => setPickingItemId(undefined)}
                            className="px-2 py-1 bg-white text-blue-600 text-xs font-medium rounded hover:bg-blue-50"
                          >
                            Cancel
                          </button>
                        </div>
                        {isReverseGeocoding && (
                          <div className="mt-2 flex items-center gap-2 text-xs">
                            <div className="animate-spin">⏳</div>
                            <span>Getting address...</span>
                          </div>
                        )}
                      </div>
                    )}

                    <MapPanel
                      items={(activeD.customItems as ItineraryItem[])}
                      cityCenter={[city.latitude, city.longitude]}
                      onMarkerClick={onMarkerClick}
                      defaultCollapsed={false}
                      onMapClick={onMapClick}
                      pickingMode={!!pickingItemId}
                    />
                  </>
                ) : (
                  <MapPremiumTeaser />
                )}
              </div>

              {/* Budget Summary (hidden on mobile, shown in sidebar on desktop) */}
              <div className="hidden lg:block">
                <BudgetSummaryPanel
                  items={(activeD.customItems as ItineraryItem[])}
                  baseCosts={costs}
                  includeBase={activeD.includeBase}
                  included={activeD.included}
                  currencySymbol={city.currencySymbol}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DragOverlay — tarjeta flotante durante el arrastre */}
      <DragOverlay>
        {activeItem ? (
          <DragOverlayCard item={activeItem} currencySymbol={city.currencySymbol} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
