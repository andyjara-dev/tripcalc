'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import CustomItemForm from './CustomItemForm';
import CustomItemCard from './CustomItemCard';
import type { CustomItemLocal } from '@/lib/validations/custom-item';

type ItemCategory = 'ACCOMMODATION' | 'FOOD' | 'TRANSPORT' | 'ACTIVITIES' | 'SHOPPING' | 'OTHER';

interface CustomItemsListProps {
  category: ItemCategory;
  cityId: string;
  currency: string;
  currencySymbol: string;
  items: CustomItemLocal[];
  onAdd: (item: Omit<CustomItemLocal, 'id'>) => void;
  onRemove: (id: string) => void;
}

export default function CustomItemsList({
  category,
  items,
  onAdd,
  onRemove,
  currencySymbol
}: CustomItemsListProps) {
  const [isAdding, setIsAdding] = useState(false);
  const t = useTranslations('calculator.customItems');

  const categoryItems = items.filter(i => i.category === category);

  // Get button text based on category
  const getAddButtonText = () => {
    switch (category) {
      case 'ACCOMMODATION':
        return t('addCustomAccommodation');
      case 'FOOD':
        return t('addCustomFood');
      case 'TRANSPORT':
        return t('addCustomTransport');
      default:
        return t('addCustom');
    }
  };

  return (
    <div className="mt-3 pl-6 space-y-2">
      {categoryItems.map(item => (
        <CustomItemCard
          key={item.id}
          item={item}
          currencySymbol={currencySymbol}
          onRemove={onRemove}
        />
      ))}

      {isAdding ? (
        <CustomItemForm
          category={category}
          currencySymbol={currencySymbol}
          onSubmit={(data) => {
            onAdd(data);
            setIsAdding(false);
          }}
          onCancel={() => setIsAdding(false)}
        />
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          + {getAddButtonText()}
        </button>
      )}
    </div>
  );
}
