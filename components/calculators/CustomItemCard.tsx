'use client';

import type { CustomItemLocal } from '@/lib/validations/custom-item';

interface CustomItemCardProps {
  item: CustomItemLocal;
  currencySymbol: string;
  onRemove: (id: string) => void;
}

export default function CustomItemCard({
  item,
  currencySymbol,
  onRemove
}: CustomItemCardProps) {
  const totalPrice = item.isOneTime
    ? item.amount
    : item.amount * item.visits;

  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
      <div className="flex-1">
        <span className="text-sm font-medium text-gray-900">{item.name}</span>
        {item.visits > 1 && (
          <span className="text-xs text-gray-700 ml-2">
            × {item.visits}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-900">
          {currencySymbol}{(totalPrice / 100).toFixed(2)}
        </span>
        <button
          onClick={() => onRemove(item.id)}
          className="text-gray-600 hover:text-red-600 text-xl leading-none px-1 font-bold"
          aria-label="Remove"
        >
          ×
        </button>
      </div>
    </div>
  );
}
