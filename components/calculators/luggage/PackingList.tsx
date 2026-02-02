'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import SaveModal from './SaveModal';

type PackingItem = {
  category: string;
  name: string;
  quantity: number;
  weightPerItem: number;
  totalWeight: number;
  essential: boolean;
  notes?: string;
  packed?: boolean; // Track if item is packed/checked
};

type Props = {
  data: {
    items: PackingItem[];
    tips: string[];
    warnings: string[];
  };
  currency: string;
  weightLimit: number; // grams
  onSave?: (tripId?: string, name?: string, updatedItems?: PackingItem[]) => Promise<void>;
  onDelete?: () => Promise<void>;
  isLoadedList?: boolean; // Indicates if this is a saved list being loaded
  initialName?: string; // Initial name for the list
};

export default function PackingList({ data, currency, weightLimit, onSave, onDelete, isLoadedList, initialName }: Props) {
  const t = useTranslations('luggage.list');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  // When loading a saved list, mark items that were packed
  useEffect(() => {
    if (isLoadedList && data.items.length > 0) {
      const packedItems = new Set<string>();
      data.items.forEach((item, index) => {
        // Mark as checked if item has packed=true, or if packed is undefined (backwards compatibility - mark all)
        if (item.packed === true || item.packed === undefined) {
          packedItems.add(`${index}`);
        }
      });
      setCheckedItems(packedItems);
    }
  }, [isLoadedList, data.items]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const handleSaveClick = () => {
    setShowSaveModal(true);
  };

  const handleSaveConfirm = async (tripId?: string, name?: string) => {
    if (!onSave) return;

    setSaving(true);
    try {
      // Update items with packed status
      const updatedItems = data.items.map((item, index) => ({
        ...item,
        packed: checkedItems.has(`${index}`),
      }));

      await onSave(tripId, name, updatedItems);
      setShowSaveModal(false);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!onDelete) return;

    if (!confirm(t('confirmDelete') || '¿Estás seguro de que quieres eliminar esta lista de equipaje?')) {
      return;
    }

    setDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error('Error deleting:', error);
      alert(t('deleteFailed') || 'Error al eliminar la lista de equipaje');
    } finally {
      setDeleting(false);
    }
  };

  // Calculate current packed weight
  const packedWeight = useMemo(() => {
    let weight = 0;
    checkedItems.forEach((key) => {
      const index = parseInt(key);
      if (data.items[index]) {
        weight += data.items[index].totalWeight;
      }
    });
    return weight;
  }, [checkedItems, data.items]);

  const remainingWeight = weightLimit - packedWeight;
  const percentage = (packedWeight / weightLimit) * 100;
  const isOverweight = packedWeight > weightLimit;
  const isClose = percentage > 90 && !isOverweight;

  // Color based on weight status
  let barColor = 'bg-green-500';
  let bgColor = 'bg-green-50';
  let borderColor = 'border-green-200';
  let textColor = 'text-green-800';

  if (isOverweight) {
    barColor = 'bg-red-500';
    bgColor = 'bg-red-50';
    borderColor = 'border-red-200';
    textColor = 'text-red-800';
  } else if (isClose) {
    barColor = 'bg-yellow-500';
    bgColor = 'bg-yellow-50';
    borderColor = 'border-yellow-200';
    textColor = 'text-yellow-800';
  }

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
    'Ropa': '👕',
    'Shoes': '👟',
    'Zapatos': '👟',
    'Accessories': '🎒',
    'Accesorios': '🎒',
    'Toiletries': '🧴',
    'Artículos de aseo': '🧴',
    'Electronics': '📱',
    'Electrónicos': '📱',
    'Documents': '📄',
    'Documentos': '📄',
    'Other': '📦',
    'Otros': '📦',
  };

  return (
    <div className="space-y-6">
      {/* Sticky Weight Tracker */}
      <div className="sticky top-0 z-10 bg-gray-50 pb-4">
        <div className={`${bgColor} border ${borderColor} rounded-lg p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('currentWeight')} 🎒
              </h3>
              <p className="text-xs text-gray-600">{t('currentWeightDescription')}</p>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold ${textColor}`}>
                {(packedWeight / 1000).toFixed(2)}kg
              </p>
              <p className="text-sm text-gray-600">
                {t('of')} {(weightLimit / 1000).toFixed(0)}kg
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full bg-gray-200 rounded-full h-6 mb-4">
            <div
              className={`${barColor} h-6 rounded-full transition-all duration-500 flex items-center justify-center`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            >
              {percentage > 10 && (
                <span className="text-xs font-semibold text-white">
                  {percentage.toFixed(0)}%
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">{t('remaining')}</p>
              <p className={`font-semibold ${remainingWeight < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {remainingWeight < 0 ? '-' : '+'}{Math.abs(remainingWeight / 1000).toFixed(2)}kg
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">{t('packed')}</p>
              <p className="font-semibold text-gray-900">
                {checkedItems.size} / {data.items.length} {t('items')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Packing List */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
            <p className="text-sm text-gray-600 mt-1">{t('checkItemsDescription')}</p>
          </div>
          <div className="flex gap-2">
            {onDelete && isLoadedList && (
              <button
                onClick={handleDeleteClick}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {deleting ? '⏳ Eliminando...' : '🗑️ Eliminar'}
              </button>
            )}
            {onSave && (
              <button
                onClick={handleSaveClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
              >
                💾 {isLoadedList ? t('update') || 'Actualizar' : t('save')}
              </button>
            )}
          </div>
        </div>

        {/* Items by Category */}
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <span className="mr-2 text-2xl">{categoryIcons[category] || '📦'}</span>
                {category}
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({items.length} {t('items')})
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
                                  {t('essential')}
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
                                ({item.weightPerItem}g {t('each')})
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

      {/* Save reminder */}
      {onSave && checkedItems.size > 0 && (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 flex items-center justify-between">
          <p className="text-gray-900">
            💡 {t('saveReminder')}
          </p>
          <button
            onClick={handleSaveClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
          >
            💾 {t('save')}
          </button>
        </div>
      )}

      {/* Save Modal */}
      {onSave && (
        <SaveModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSaveConfirm}
          saving={saving}
          initialName={initialName}
        />
      )}
    </div>
  );
}
