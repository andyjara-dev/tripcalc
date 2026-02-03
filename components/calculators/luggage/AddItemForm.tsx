'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { createPackingItem } from '@/lib/utils/packing-helpers';
import { getItemSuggestions, getLocalizedItemName } from '@/lib/data/weight-database';
import type { PackingItem, CommonItem, WeightSuggestion } from '@/lib/types/packing';

type AddItemFormProps = {
  existingCategories: string[];
  onAdd: (item: PackingItem) => void;
};

export function AddItemForm({ existingCategories, onAdd }: AddItemFormProps) {
  const t = useTranslations('luggage.manualItems');
  const locale = useLocale();

  const [isOpen, setIsOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [weight, setWeight] = useState<number | ''>('');
  const [essential, setEssential] = useState(false);
  const [notes, setNotes] = useState('');

  const [suggestions, setSuggestions] = useState<CommonItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFetchingSuggestion, setIsFetchingSuggestion] = useState(false);
  const [weightSuggestion, setWeightSuggestion] = useState<WeightSuggestion | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Autocomplete suggestions
  useEffect(() => {
    if (itemName.length >= 2) {
      const results = getItemSuggestions(itemName, locale, 8);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [itemName, locale]);

  // Handle item suggestion selection
  const handleSelectSuggestion = (item: CommonItem) => {
    setItemName(getLocalizedItemName(item, locale));
    setCategory(item.category);
    setWeight(item.weight);
    setNotes(item.notes || '');
    setShowSuggestions(false);
    setWeightSuggestion({
      weight: item.weight,
      confidence: 'high',
      source: 'database',
      notes: item.notes,
    });
  };

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
      if (suggestion.notes) {
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
    const newItem = createPackingItem(
      itemName.trim(),
      selectedCategory,
      Number(weight),
      quantity,
      essential,
      notes.trim() || undefined
    );

    onAdd(newItem);

    // Reset form
    setItemName('');
    setCategory('');
    setIsNewCategory(false);
    setNewCategoryName('');
    setQuantity(1);
    setWeight('');
    setEssential(false);
    setNotes('');
    setWeightSuggestion(null);
    setErrors({});
    setIsOpen(false);
  };

  // Handle cancel
  const handleCancel = () => {
    setItemName('');
    setCategory('');
    setIsNewCategory(false);
    setNewCategoryName('');
    setQuantity(1);
    setWeight('');
    setEssential(false);
    setNotes('');
    setWeightSuggestion(null);
    setErrors({});
    setShowSuggestions(false);
    setIsOpen(false);
  };

  return (
    <div className="border-t border-neutral-200 pt-6 mt-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors"
      >
        <span className="font-medium text-gray-900">{t('addItem')}</span>
        <svg
          className={`w-5 h-5 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 p-4 bg-neutral-50 rounded-lg">
          {/* Item Name with Autocomplete */}
          <div className="relative">
            <label htmlFor="itemName" className="block text-sm font-medium text-neutral-700 mb-1">
              {t('itemName')}
            </label>
            <input
              type="text"
              id="itemName"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onFocus={() => itemName.length >= 2 && setShowSuggestions(suggestions.length > 0)}
              placeholder={t('itemNamePlaceholder')}
              className={`w-full px-4 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.itemName ? 'border-red-500' : 'border-neutral-300'
              }`}
            />
            {errors.itemName && <p className="text-sm text-red-600 mt-1">{errors.itemName}</p>}

            {/* Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2 text-xs text-neutral-500 font-medium uppercase">{t('suggestions')}</div>
                {suggestions.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full text-left px-4 py-2 hover:bg-neutral-100 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-neutral-900">
                        {getLocalizedItemName(item, locale)}
                      </div>
                      <div className="text-xs text-neutral-500">{item.category}</div>
                    </div>
                    <div className="text-sm text-neutral-600">{item.weight}g</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Selection */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-1">
              {t('category')}
            </label>
            <div className="flex gap-2">
              <select
                id="category"
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
                className="mt-2 w-full px-4 py-2 border border-neutral-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            )}
            {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
          </div>

          {/* Quantity and Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-neutral-700 mb-1">
                {t('quantity')}
              </label>
              <input
                type="number"
                id="quantity"
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
              <label htmlFor="weight" className="block text-sm font-medium text-neutral-700 mb-1">
                {t('weightPerItem')}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  id="weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                  placeholder={t('weightPlaceholder')}
                  min="10"
                  max="50000"
                  className={`flex-1 px-4 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
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
            <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-1">
              {t('notes')}
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('notesPlaceholder')}
              rows={2}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Essential Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="essential"
              checked={essential}
              onChange={(e) => setEssential(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="essential" className="ml-2 text-sm text-neutral-700">
              {t('essential')}
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 border border-neutral-300 text-gray-900 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {t('addItemButton')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
