'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

type PackingItem = {
  category: string;
  name: string;
  quantity: number;
  weightPerItem: number;
  totalWeight: number;
  essential: boolean;
  notes?: string;
};

type Props = {
  data: {
    items: PackingItem[];
    tips: string[];
    warnings: string[];
  };
  currency: string;
  onSave?: () => void;
};

export default function PackingList({ data, currency, onSave }: Props) {
  const t = useTranslations('luggage.list');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const handleToggle = (index: number) => {
    const newChecked = new Set(checkedItems);
    const key = `${index}`;
    if (newChecked.has(key)) {
      newChecked.delete(key);
    } else {
      newChecked.add(key);
    }
    setCheckedItems(newChecked);
  };

  // Group items by category
  const groupedItems = data.items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PackingItem[]>);

  const categoryIcons: Record<string, string> = {
    'Clothing': '👕',
    'Shoes': '👟',
    'Accessories': '🎒',
    'Toiletries': '🧴',
    'Electronics': '📱',
    'Documents': '📄',
    'Other': '📦',
  };

  return (
    <div className="space-y-6">
      {/* Packing List */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
          {onSave && (
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
            >
              💾 {t('save')}
            </button>
          )}
        </div>

        {/* Items by Category */}
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span className="mr-2 text-2xl">{categoryIcons[category] || '📦'}</span>
                {category}
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({items.length} items)
                </span>
              </h3>

              <div className="space-y-2">
                {items.map((item, index) => {
                  const globalIndex = data.items.indexOf(item);
                  const isChecked = checkedItems.has(`${globalIndex}`);

                  return (
                    <div
                      key={globalIndex}
                      className={`flex items-start p-3 rounded-lg border transition ${
                        isChecked
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggle(globalIndex)}
                        className="mt-1 mr-3 w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                      />

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className={`font-medium ${isChecked ? 'line-through text-gray-600' : 'text-gray-900'}`}>
                              {item.name}
                              {item.quantity > 1 && (
                                <span className="ml-2 text-sm text-gray-600">
                                  x{item.quantity}
                                </span>
                              )}
                              {item.essential && (
                                <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                  Essential
                                </span>
                              )}
                            </p>
                            {item.notes && (
                              <p className="text-sm text-gray-600 mt-1">💡 {item.notes}</p>
                            )}
                          </div>

                          <div className="text-right ml-4">
                            <p className="text-sm font-semibold text-gray-900">
                              {item.totalWeight}g
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs text-gray-600">
                                ({item.weightPerItem}g each)
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      {data.tips.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <span className="mr-2">💡</span>
            {t('packingTips')}
          </h3>
          <ul className="space-y-2">
            {data.tips.map((tip, index) => (
              <li key={index} className="flex items-start text-gray-900">
                <span className="mr-2 text-blue-600">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {data.warnings && data.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <span className="mr-2">⚠️</span>
            {t('warnings')}
          </h3>
          <ul className="space-y-2">
            {data.warnings.map((warning, index) => (
              <li key={index} className="flex items-start text-gray-900">
                <span className="mr-2 text-yellow-600">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Progress */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-900">
            {t('packed')}: {checkedItems.size} / {data.items.length}
          </span>
          <span className="text-gray-900 font-semibold">
            {Math.round((checkedItems.size / data.items.length) * 100)}%
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(checkedItems.size / data.items.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
