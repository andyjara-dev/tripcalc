'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { ExpenseDisplay } from '@/lib/validations/expense';
import AddExpenseModal from './AddExpenseModal';

type ItemCategory = 'ACCOMMODATION' | 'FOOD' | 'TRANSPORT' | 'ACTIVITIES' | 'SHOPPING' | 'OTHER';

interface ExpensesListProps {
  tripId: string;
  expenses: ExpenseDisplay[];
  currencySymbol: string;
  onExpenseAdded: () => void;
}

export default function ExpensesList({
  tripId,
  expenses,
  currencySymbol,
  onExpenseAdded,
}: ExpensesListProps) {
  const t = useTranslations('trips');
  const locale = useLocale();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseDisplay | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<string | null>(null);

  const handleAddExpense = async (expenseData: {
    name: string;
    category: ItemCategory;
    amount: number;
    date: string;
    notes?: string;
  }) => {
    const response = await fetch(`/api/trips/${tripId}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: expenseData.name,
        category: expenseData.category,
        amount: expenseData.amount,
        currency: 'USD', // TODO: Get from trip/city data
        date: expenseData.date,
        notes: expenseData.notes,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add expense');
    }

    onExpenseAdded();
  };

  const handleUpdateExpense = async (expenseData: {
    name: string;
    category: ItemCategory;
    amount: number;
    date: string;
    notes?: string;
  }) => {
    if (!editingExpense) return;

    const response = await fetch(`/api/trips/${tripId}/expenses/${editingExpense.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: expenseData.name,
        category: expenseData.category,
        amount: expenseData.amount,
        currency: 'USD',
        date: expenseData.date,
        notes: expenseData.notes,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update expense');
    }

    setEditingExpense(null);
    onExpenseAdded();
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm(t('deleteExpenseConfirm'))) return;

    setDeletingExpense(expenseId);

    try {
      const response = await fetch(`/api/trips/${tripId}/expenses/${expenseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      onExpenseAdded(); // Refresh list
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    } finally {
      setDeletingExpense(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Sort expenses by date (newest first)
  const sortedExpenses = [...expenses].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4">
      {/* Header with Add button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">{t('expenses')}</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + {t('addExpense')}
        </button>
      </div>

      {/* Expenses list */}
      {sortedExpenses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-3">💰</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('noExpenses')}
          </h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            {t('noExpensesMessage')}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            {t('addExpense')}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedExpenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{expense.name}</h4>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                      {t(`categories.${expense.category}`)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{formatDate(expense.date)}</p>
                  {expense.notes && (
                    <p className="text-sm text-gray-500 mt-1">{expense.notes}</p>
                  )}
                </div>
                <div className="text-right flex items-start gap-2">
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      {currencySymbol}{(expense.amount / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => setEditingExpense(expense)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                      title={t('edit')}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      disabled={deletingExpense === expense.id}
                      className="text-red-600 hover:text-red-700 text-sm disabled:opacity-50"
                      title={t('delete')}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AddExpenseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddExpense}
        currencySymbol={currencySymbol}
      />

      {editingExpense && (
        <AddExpenseModal
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
          onSave={handleUpdateExpense}
          currencySymbol={currencySymbol}
          expense={editingExpense}
        />
      )}
    </div>
  );
}
