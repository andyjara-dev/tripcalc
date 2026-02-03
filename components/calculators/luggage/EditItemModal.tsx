'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { updatePackingItem } from '@/lib/utils/packing-helpers';
import type { PackingItem, WeightSuggestion } from '@/lib/types/packing';

type EditItemModalProps = {
  item: PackingItem;
  existingCategories: string[];
  onSave: (updatedItem: PackingItem) => void;
  onDelete: (itemId: string) => void;
  onCancel: () => void;
};

export function EditItemModal({
  item,
  existingCategories,
  onSave,
  onDelete,
  onCancel,
}: EditItemModalProps) {
  const t = useTranslations('luggage.manualItems');
  const locale = useLocale();

  const [itemName, setItemName] = useState(item.name);
  const [category, setCategory] = useState(item.category);
  const [isNewCategory, setIsNewCategory] = useState(!existingCategories.includes(item.category));
  const [newCategoryName, setNewCategoryName] = useState(isNewCategory ? item.category : '');
  const [quantity, setQuantity] = useState(item.quantity);
  const [weight, setWeight] = useState<number | ''>(item.weightPerItem);
  const [essential, setEssential] = useState(item.essential);
  const [notes, setNotes] = useState(item.notes || '');

  const [isFetchingSuggestion, setIsFetchingSuggestion] = useState(false);
  const [weightSuggestion, setWeightSuggestion] = useState<WeightSuggestion | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Suggest weight using AI
  const handleSuggestWeight = async () => {
    if (!itemName.trim()) {
      setErrors({ itemName: t('validation.nameRequired') });
      return;
    }

    setIsFetchingSuggestion(true);
    setWeightSuggestion(null);

    try {
      const response = await fetch('/api/luggage/suggest-weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: itemName.trim(),
          category: category || undefined,
          locale,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch weight suggestion');
      }

      const suggestion: WeightSuggestion = await response.json();
      setWeight(suggestion.weight);
      setWeightSuggestion(suggestion);
      if (suggestion.notes && !notes) {
        setNotes(suggestion.notes);
      }
    } catch (error) {
      console.error('Error fetching weight suggestion:', error);
      setErrors({ weight: t('noSuggestion') });
    } finally {
      setIsFetchingSuggestion(false);
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!itemName.trim()) {
      newErrors.itemName = t('validation.nameRequired');
    }

    const selectedCategory = isNewCategory ? newCategoryName : category;
    if (!selectedCategory.trim()) {
      newErrors.category = t('validation.categoryRequired');
    }

    if (quantity < 1) {
      newErrors.quantity = t('validation.quantityMin');
    }

    if (weight === '' || weight < 10) {
      newErrors.weight = t('validation.weightMin');
    } else if (weight > 50000) {
      newErrors.weight = t('validation.weightMax');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const selectedCategory = isNewCategory ? newCategoryName.trim() : category;
    const updatedItem = updatePackingItem(item, {
      name: itemName.trim(),
      category: selectedCategory,
      quantity,
      weightPerItem: Number(weight),
      essential,
      notes: notes.trim() || undefined,
    });

    onSave(updatedItem);
  };

  // Handle delete
  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(item.id);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">{t('editItemTitle')}</h2>
              <p className="text-sm text-neutral-500 mt-1">
                {item.source === 'ai' ? (
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    {t('aiGenerated')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {t('manuallyAdded')}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Item Name */}
          <div>
            <label htmlFor="editItemName" className="block text-sm font-medium text-gray-900 mb-1">
              {t('itemName')}
            </label>
            <input
              type="text"
              id="editItemName"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder={t('itemNamePlaceholder')}
              className={`w-full px-4 py-2 border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.itemName ? 'border-red-500' : 'border-neutral-300'
              }`}
            />
            {errors.itemName && <p className="text-sm text-red-600 mt-1">{errors.itemName}</p>}
          </div>

          {/* Category Selection */}
          <div>
            <label htmlFor="editCategory" className="block text-sm font-medium text-gray-900 mb-1">
              {t('category')}
            </label>
            <div className="flex gap-2">
              <select
                id="editCategory"
                value={isNewCategory ? 'new' : category}
                onChange={(e) => {
                  if (e.target.value === 'new') {
                    setIsNewCategory(true);
                    setCategory('');
                  } else {
                    setIsNewCategory(false);
                    setCategory(e.target.value);
                  }
                }}
                className={`flex-1 px-4 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.category ? 'border-red-500' : 'border-neutral-300'
                }`}
              >
                <option value="">{t('categoryPlaceholder')}</option>
                {existingCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="new">{t('newCategory')}</option>
              </select>
            </div>
            {isNewCategory && (
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder={t('newCategoryPlaceholder')}
                className="mt-2 w-full px-4 py-2 border border-neutral-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            )}
            {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
          </div>

          {/* Quantity and Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="editQuantity" className="block text-sm font-medium text-gray-900 mb-1">
                {t('quantity')}
              </label>
              <input
                type="number"
                id="editQuantity"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className={`w-full px-4 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.quantity ? 'border-red-500' : 'border-neutral-300'
                }`}
              />
              {errors.quantity && <p className="text-sm text-red-600 mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <label htmlFor="editWeight" className="block text-sm font-medium text-gray-900 mb-1">
                {t('weightPerItem')}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  id="editWeight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                  placeholder={t('weightPlaceholder')}
                  min="10"
                  max="50000"
                  className={`flex-1 px-4 py-2 border rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.weight ? 'border-red-500' : 'border-neutral-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleSuggestWeight}
                  disabled={isFetchingSuggestion}
                  className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm"
                >
                  {isFetchingSuggestion ? '...' : '✨'}
                </button>
              </div>
              {errors.weight && <p className="text-sm text-red-600 mt-1">{errors.weight}</p>}
              {weightSuggestion && (
                <p className="text-xs text-neutral-600 mt-1">
                  {weightSuggestion.source === 'database' ? (
                    <span className="text-green-600">✓ {t('fromDatabase')}</span>
                  ) : (
                    <span className="text-blue-600">✓ {t('fromAI')}</span>
                  )}
                  {' • '}
                  {weightSuggestion.confidence === 'high' && t('highConfidence')}
                  {weightSuggestion.confidence === 'medium' && t('mediumConfidence')}
                  {weightSuggestion.confidence === 'low' && t('lowConfidence')}
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="editNotes" className="block text-sm font-medium text-gray-900 mb-1">
              {t('notes')}
            </label>
            <textarea
              id="editNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('notesPlaceholder')}
              rows={2}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Essential Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="editEssential"
              checked={essential}
              onChange={(e) => setEssential(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="editEssential" className="ml-2 text-sm text-gray-900">
              {t('essential')}
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={handleDelete}
              className={`px-4 py-2 rounded-lg transition-colors ${
                showDeleteConfirm
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'border border-red-300 text-red-700 hover:bg-red-50'
              }`}
            >
              {showDeleteConfirm ? t('confirmDeleteItem') : t('deleteItem')}
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-neutral-300 text-gray-900 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {t('saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
