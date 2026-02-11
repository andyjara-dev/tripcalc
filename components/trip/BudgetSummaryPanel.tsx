'use client';

import { useTranslations } from 'next-intl';
import type { ItineraryItem } from '@/lib/types/itinerary';

interface BudgetSummaryPanelProps {
  items: ItineraryItem[];
  baseCosts: {
    accommodation: number;
    food: number;
    transport: number;
    activities: number;
  };
  includeBase: {
    accommodation: boolean;
    food: boolean;
    transport: boolean;
    activities: boolean;
  };
  included: {
    accommodation: boolean;
    food: boolean;
    transport: boolean;
    activities: boolean;
  };
  currencySymbol: string;
}

const categoryConfig = [
  { key: 'accommodation', category: 'ACCOMMODATION', icon: '🏨' },
  { key: 'food', category: 'FOOD', icon: '🍽️' },
  { key: 'transport', category: 'TRANSPORT', icon: '🚇' },
  { key: 'activities', category: 'ACTIVITIES', icon: '🎭' },
] as const;

export default function BudgetSummaryPanel({
  items,
  baseCosts,
  includeBase,
  included,
  currencySymbol,
}: BudgetSummaryPanelProps) {
  const t = useTranslations('unifiedView');
  const tCalc = useTranslations('calculator');

  const getCategoryTotal = (categoryKey: keyof typeof baseCosts, categoryName: string) => {
    if (!included[categoryKey]) return 0;
    const base = includeBase[categoryKey] ? baseCosts[categoryKey] : 0;
    const customTotal = items
      .filter(item => item.category === categoryName)
      .reduce((sum, item) => sum + (item.amount * item.visits), 0) / 100;
    return base + customTotal;
  };

  const dayTotal = categoryConfig.reduce(
    (sum, { key, category }) => sum + getCategoryTotal(key, category),
    0
  );

  // Also count SHOPPING and OTHER items
  const otherTotal = items
    .filter(item => item.category === 'SHOPPING' || item.category === 'OTHER')
    .reduce((sum, item) => sum + (item.amount * item.visits), 0) / 100;

  const grandTotal = dayTotal + otherTotal;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
        {t('budgetBreakdown')}
      </h3>

      <div className="space-y-2">
        {categoryConfig.map(({ key, category, icon }) => {
          const total = getCategoryTotal(key, category);
          return (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-gray-700">
                <span>{icon}</span>
                <span>{tCalc(key)}</span>
              </span>
              <span className={`font-semibold ${included[key] ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                {currencySymbol}{total.toFixed(0)}
              </span>
            </div>
          );
        })}

        {otherTotal > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-700">
              <span>🛍️</span>
              <span>Other</span>
            </span>
            <span className="font-semibold text-gray-900">
              {currencySymbol}{otherTotal.toFixed(0)}
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 mt-3 pt-3 flex items-center justify-between">
        <span className="font-semibold text-gray-700 text-sm">{t('dayTotal')}</span>
        <span className="text-xl font-bold text-gray-900">
          {currencySymbol}{grandTotal.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

// Compact version for mobile budget bar
export function BudgetBar({
  items,
  baseCosts,
  includeBase,
  included,
  currencySymbol,
}: BudgetSummaryPanelProps) {
  const getCategoryTotal = (categoryKey: keyof typeof baseCosts, categoryName: string) => {
    if (!included[categoryKey]) return 0;
    const base = includeBase[categoryKey] ? baseCosts[categoryKey] : 0;
    const customTotal = items
      .filter(item => item.category === categoryName)
      .reduce((sum, item) => sum + (item.amount * item.visits), 0) / 100;
    return base + customTotal;
  };

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-1 text-sm">
      {categoryConfig.map(({ key, category, icon }) => {
        const total = getCategoryTotal(key, category);
        if (!included[key]) return null;
        return (
          <span key={key} className="flex items-center gap-1 whitespace-nowrap text-gray-700">
            <span>{icon}</span>
            <span className="font-semibold">{currencySymbol}{total.toFixed(0)}</span>
          </span>
        );
      })}
    </div>
  );
}
