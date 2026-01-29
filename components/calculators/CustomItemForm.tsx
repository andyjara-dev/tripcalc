'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { CustomItemLocal } from '@/lib/validations/custom-item';

type ItemCategory = 'ACCOMMODATION' | 'FOOD' | 'TRANSPORT' | 'ACTIVITIES' | 'SHOPPING' | 'OTHER';

interface CustomItemFormProps {
  category: ItemCategory;
  currencySymbol: string;
  onSubmit: (data: Omit<CustomItemLocal, 'id'>) => void;
  onCancel: () => void;
}

export default function CustomItemForm({
  category,
  currencySymbol,
  onSubmit,
  onCancel
}: CustomItemFormProps) {
  const t = useTranslations('calculator.customItems.form');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [visits, setVisits] = useState(1);
  const [notes, setNotes] = useState('');

  // Get placeholder based on category
  const getPlaceholder = () => {
    switch (category) {
      case 'ACCOMMODATION':
        return t('namePlaceholderAccommodation');
      case 'FOOD':
        return t('namePlaceholderFood');
      case 'TRANSPORT':
        return t('namePlaceholderTransport');
      default:
        return t('namePlaceholder');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !price || parseFloat(price) <= 0) return;

    onSubmit({
      category,
      name: name.trim(),
      amount: Math.round(parseFloat(price) * 100), // Convert to cents
      visits,
      isOneTime: visits === 1,
      notes: notes.trim() || undefined,
    });

    // Reset
    setName('');
    setPrice('');
    setVisits(1);
    setNotes('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-gray-50 rounded space-y-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={getPlaceholder()}
        className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        required
      />

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-gray-900 font-medium">{t('price')}</label>
          <div className="flex items-center gap-1">
            <span className="text-gray-700 font-medium">{currencySymbol}</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              min="0"
              className="flex-1 px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="w-24">
          <label className="text-xs text-gray-900 font-medium">{t('visits')}</label>
          <input
            type="number"
            value={visits}
            onChange={(e) => setVisits(parseInt(e.target.value) || 1)}
            min="1"
            max="20"
            className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900 font-medium"
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {t('add')}
        </button>
      </div>
    </form>
  );
}
