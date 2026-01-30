'use client';

import { useTranslations } from 'next-intl';
import type { ExpenseDisplay } from '@/lib/validations/expense';

type ItemCategory = 'ACCOMMODATION' | 'FOOD' | 'TRANSPORT' | 'ACTIVITIES' | 'SHOPPING' | 'OTHER';

interface BudgetVsActualProps {
  budget: {
    accommodation: number;
    food: number;
    transport: number;
    activities: number;
  };
  expenses: ExpenseDisplay[];
  days: number;
  currencySymbol: string;
}

export default function BudgetVsActual({
  budget,
  expenses,
  days,
  currencySymbol,
}: BudgetVsActualProps) {
  const t = useTranslations('trips');

  // Calculate total expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const category = expense.category;
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Calculate total budget (daily * days)
  const totalBudget = (
    budget.accommodation +
    budget.food +
    budget.transport +
    budget.activities
  ) * days;

  // Calculate total actual expenses
  const totalActual = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);

  const difference = totalBudget - totalActual;
  const percentageUsed = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

  // Status determination
  const getStatus = () => {
    if (Math.abs(difference) < totalBudget * 0.05) return 'onTrack'; // Within 5%
    return difference >= 0 ? 'underBudget' : 'overBudget';
  };

  const status = getStatus();

  const categories: Array<{ key: keyof typeof budget; name: ItemCategory }> = [
    { key: 'accommodation', name: 'ACCOMMODATION' },
    { key: 'food', name: 'FOOD' },
    { key: 'transport', name: 'TRANSPORT' },
    { key: 'activities', name: 'ACTIVITIES' },
  ];

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{t('budgetVsActual')}</h3>
            <p className="text-sm text-gray-600">{days} {days === 1 ? 'day' : 'days'} trip</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
            status === 'onTrack' ? 'bg-green-100 text-green-800' :
            status === 'underBudget' ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            {t(status)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">{t('totalBudget')}</p>
            <p className="text-2xl font-bold text-gray-900">
              {currencySymbol}{(totalBudget / 100).toFixed(0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">{t('totalActual')}</p>
            <p className="text-2xl font-bold text-gray-900">
              {currencySymbol}{(totalActual / 100).toFixed(0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">
              {difference >= 0 ? t('remaining') : t('over')}
            </p>
            <p className={`text-2xl font-bold ${
              difference >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {currencySymbol}{Math.abs(difference / 100).toFixed(0)}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                percentageUsed > 100 ? 'bg-red-600' :
                percentageUsed > 90 ? 'bg-yellow-600' :
                'bg-green-600'
              }`}
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1 text-right">
            {percentageUsed.toFixed(1)}% used
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">By Category</h4>
        {categories.map(({ key, name }) => {
          const categoryBudget = budget[key] * days;
          const categoryActual = expensesByCategory[name] || 0;
          const categoryDiff = categoryBudget - categoryActual;
          const categoryPercent = categoryBudget > 0 ? (categoryActual / categoryBudget) * 100 : 0;

          return (
            <div key={key} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">{t(`categories.${name}`)}</span>
                <span className={`text-sm font-semibold ${
                  categoryDiff >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {categoryDiff >= 0 ? '-' : '+'}{currencySymbol}{Math.abs(categoryDiff / 100).toFixed(0)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                <div>
                  <span className="text-gray-600">{t('budget')}:</span>
                  <span className="ml-1 font-medium">{currencySymbol}{(categoryBudget / 100).toFixed(0)}</span>
                </div>
                <div>
                  <span className="text-gray-600">{t('actual')}:</span>
                  <span className="ml-1 font-medium">{currencySymbol}{(categoryActual / 100).toFixed(0)}</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    categoryPercent > 100 ? 'bg-red-500' :
                    categoryPercent > 90 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(categoryPercent, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
