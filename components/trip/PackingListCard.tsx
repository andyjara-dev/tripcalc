'use client';

import { useState } from 'react';
import Link from 'next/link';

type PackingItem = {
  category: string;
  name: string;
  quantity: number;
  weightPerItem: number;
  totalWeight: number;
  essential: boolean;
  notes?: string;
};

type PackingList = {
  id: string;
  luggageType: string;
  weightLimit: number;
  totalWeight: number;
  items: PackingItem[];
  tips: string[];
  warnings?: string[];
  createdAt: string;
};

type Props = {
  packingList: PackingList;
  locale: string;
  onDelete?: () => void;
};

export default function PackingListCard({ packingList, locale, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const percentage = (packingList.totalWeight / packingList.weightLimit) * 100;
  const isOverweight = percentage > 100;
  const isClose = percentage > 90 && !isOverweight;

  let statusColor = 'text-green-600';
  let barColor = 'bg-green-500';
  if (isOverweight) {
    statusColor = 'text-red-600';
    barColor = 'bg-red-500';
  } else if (isClose) {
    statusColor = 'text-yellow-600';
    barColor = 'bg-yellow-500';
  }

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm('¿Estás seguro de eliminar esta lista de equipaje?')) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/luggage/${packingList.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDelete();
      } else {
        alert('Error al eliminar la lista');
      }
    } catch (error) {
      console.error('Error deleting packing list:', error);
      alert('Error al eliminar la lista');
    } finally {
      setDeleting(false);
    }
  };

  // Group items by category
  const groupedItems = packingList.items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PackingItem[]>);

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              🧳 Lista de Equipaje
              <span className="text-sm font-normal text-gray-600">
                ({packingList.luggageType})
              </span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Creada: {new Date(packingList.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/${locale}/calculators/luggage?loadId=${packingList.id}`}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              ✏️ Editar
            </Link>
            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                🗑️ {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            )}
          </div>
        </div>

        {/* Weight Summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Peso total:</span>
            <span className={`font-bold ${statusColor}`}>
              {(packingList.totalWeight / 1000).toFixed(2)}kg / {(packingList.weightLimit / 1000).toFixed(0)}kg
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`${barColor} h-3 rounded-full transition-all`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{packingList.items.length} items</span>
            <span>{percentage.toFixed(0)}%</span>
          </div>
        </div>

        {/* Toggle expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          {expanded ? '▼ Ver menos' : '▶ Ver detalles completos'}
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="p-6 space-y-6">
          {/* Items by category */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Items:</h4>
            <div className="space-y-4">
              {Object.entries(groupedItems).map(([category, items]) => (
                <div key={category} className="border border-gray-200 rounded-lg p-3">
                  <h5 className="font-medium text-gray-900 mb-2">
                    {category} ({items.length})
                  </h5>
                  <ul className="space-y-1 text-sm">
                    {items.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-gray-700">
                        <span>
                          {item.name} {item.quantity > 1 && `x${item.quantity}`}
                          {item.essential && (
                            <span className="ml-1 text-xs bg-red-100 text-red-800 px-1 rounded">
                              Esencial
                            </span>
                          )}
                        </span>
                        <span className="text-gray-600">{item.totalWeight}g</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          {packingList.tips.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <span className="mr-2">💡</span>
                Consejos de Empaque
              </h4>
              <ul className="space-y-1 text-sm text-gray-900">
                {packingList.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="mr-2 text-blue-600">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {packingList.warnings && packingList.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <span className="mr-2">⚠️</span>
                Advertencias
              </h4>
              <ul className="space-y-1 text-sm text-gray-900">
                {packingList.warnings.map((warning, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="mr-2 text-yellow-600">•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
