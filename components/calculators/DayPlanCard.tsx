'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { nanoid } from 'nanoid';
import type { CityData } from '@/data/cities';
import type { DayPlan, TripStyle, CustomItemLocal, ItemCategory } from '@/types/trip-planner';
import { calculateDayCost } from '@/types/trip-planner';
import CustomItemsList from './CustomItemsList';

interface DayPlanCardProps {
  day: DayPlan;
  city: CityData;
  costs: {
    accommodation: number;
    food: number;
    transport: number;
    activities: number;
  };
  tripStyle: TripStyle;
  totalDays: number;
  onUpdate: (updates: Partial<DayPlan>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}

export default function DayPlanCard({
  day,
  city,
  costs,
  tripStyle,
  totalDays,
  onUpdate,
  onRemove,
  onDuplicate,
}: DayPlanCardProps) {
  const t = useTranslations('calculator');
  const [isEditingDate, setIsEditingDate] = useState(false);

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

  const handleAddCustomItem = (item: Omit<CustomItemLocal, 'id'>) => {
    onUpdate({
      customItems: [...day.customItems, { ...item, id: nanoid() }],
    });
  };

  const handleRemoveCustomItem = (id: string) => {
    onUpdate({
      customItems: day.customItems.filter(item => item.id !== id),
    });
  };

  // Helper to calculate total for a category
  const getCategoryTotal = (category: ItemCategory, baseCost: number) => {
    const base = day.includeBase[category.toLowerCase() as keyof DayPlan['includeBase']] ? baseCost : 0;
    const customTotal = day.customItems
      .filter(item => item.category === category)
      .reduce((sum, item) => sum + (item.amount * item.visits), 0) / 100;
    return base + customTotal;
  };

  const dayCost = calculateDayCost(day, costs);

  // Helper component for category section
  const CategorySection = ({
    category,
    categoryKey,
    icon,
    baseCost,
  }: {
    category: ItemCategory;
    categoryKey: keyof DayPlan['included'];
    icon: string;
    baseCost: number;
  }) => {
    const isIncluded = day.included[categoryKey];
    const hasBase = day.includeBase[categoryKey];
    const categoryTotal = isIncluded ? getCategoryTotal(category, baseCost) : 0;
    const baseEstimateKey = `baseEstimate${category.charAt(0) + category.slice(1).toLowerCase()}` as any;

    return (
      <div>
        <div className={`flex justify-between items-center p-5 rounded-lg border-2 transition-all ${
          isIncluded
            ? 'border-gray-900 bg-gray-50'
            : 'border-gray-200 bg-white opacity-50'
        }`}>
          <label className="flex items-center gap-4 cursor-pointer flex-1">
            <input
              type="checkbox"
              checked={isIncluded}
              onChange={() => toggleCategory(categoryKey)}
              className="w-6 h-6 rounded border-gray-300 text-gray-900 focus:ring-gray-900 focus:ring-2"
            />
            <span className="text-gray-900 font-medium text-base flex items-center gap-2">
              <span>{icon}</span>
              <span>{t(categoryKey)}</span>
            </span>
          </label>
          <span className={`font-bold text-xl ${isIncluded ? 'text-gray-900' : 'text-gray-400'}`}>
            {city.currencySymbol}{categoryTotal.toFixed(0)}
          </span>
        </div>

        {/* Items List */}
        {isIncluded && (
          <div className="mt-3 pl-6 space-y-2">
            {/* Base estimate */}
            {hasBase && (
              <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded">
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded uppercase">
                    Base
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {t(`customItems.${baseEstimateKey}` as any)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {city.currencySymbol}{baseCost.toFixed(0)}
                  </span>
                  <button
                    onClick={() => toggleBase(categoryKey)}
                    className="text-gray-600 hover:text-red-600 text-xl leading-none px-1 font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Add back base */}
            {!hasBase && (
              <button
                onClick={() => toggleBase(categoryKey)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>+</span>
                <span>{t('customItems.addBackBase')} ({city.currencySymbol}{baseCost.toFixed(0)})</span>
              </button>
            )}

            {/* Custom items list */}
            <CustomItemsList
              category={category}
              cityId={city.id}
              currency={city.currency}
              currencySymbol={city.currencySymbol}
              items={day.customItems}
              onAdd={handleAddCustomItem}
              onRemove={handleRemoveCustomItem}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
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

          {/* Date input */}
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

          {/* Day name input */}
          <input
            type="text"
            placeholder="Day name (optional) - e.g., Arrival, Museums, Departure"
            value={day.dayName || ''}
            onChange={e => onUpdate({ dayName: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 placeholder:text-gray-400 text-sm"
          />
        </div>

        {/* Actions */}
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

      {/* Categories */}
      <div className="space-y-3">
        <CategorySection
          category="ACCOMMODATION"
          categoryKey="accommodation"
          icon="🏨"
          baseCost={costs.accommodation}
        />

        <CategorySection
          category="FOOD"
          categoryKey="food"
          icon="🍽️"
          baseCost={costs.food}
        />

        <CategorySection
          category="TRANSPORT"
          categoryKey="transport"
          icon="🚇"
          baseCost={costs.transport}
        />

        <CategorySection
          category="ACTIVITIES"
          categoryKey="activities"
          icon="🎭"
          baseCost={costs.activities}
        />
      </div>

      {/* Day Total */}
      <div className="bg-gray-100 rounded-lg p-4 flex justify-between items-center">
        <span className="text-lg font-medium text-gray-700">Day {day.dayNumber} Total:</span>
        <span className="text-2xl font-bold text-gray-900">
          {city.currencySymbol}{dayCost.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
