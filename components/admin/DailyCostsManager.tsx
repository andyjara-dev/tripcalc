'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type CityDailyCost = {
  id: string;
  travelStyle: string;
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  breakfast: number | null;
  lunch: number | null;
  dinner: number | null;
  snacks: number | null;
};

type City = {
  id: string;
  name: string;
  currency: string;
  currencySymbol: string;
  dailyCosts: CityDailyCost[];
};

type Props = {
  city: City;
};

const TRAVEL_STYLES = ['budget', 'midRange', 'luxury'] as const;

const TRAVEL_STYLE_LABELS = {
  budget: 'Budget',
  midRange: 'Mid-range',
  luxury: 'Luxury',
};

export default function DailyCostsManager({ city }: Props) {
  const router = useRouter();
  const [editingStyle, setEditingStyle] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    accommodation: 0,
    food: 0,
    transport: 0,
    activities: 0,
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snacks: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleEdit = (cost: CityDailyCost) => {
    setEditingStyle(cost.travelStyle);
    setFormData({
      accommodation: Math.round(cost.accommodation / 100),
      food: Math.round(cost.food / 100),
      transport: Math.round(cost.transport / 100),
      activities: Math.round(cost.activities / 100),
      breakfast: cost.breakfast ? Math.round(cost.breakfast / 100) : 0,
      lunch: cost.lunch ? Math.round(cost.lunch / 100) : 0,
      dinner: cost.dinner ? Math.round(cost.dinner / 100) : 0,
      snacks: cost.snacks ? Math.round(cost.snacks / 100) : 0,
    });
    setError(null);
    setSuccess(null);
  };

  const handleCreate = (style: string) => {
    setEditingStyle(style);
    setFormData({
      accommodation: 0,
      food: 0,
      transport: 0,
      activities: 0,
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snacks: 0,
    });
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const existingCost = city.dailyCosts.find(c => c.travelStyle === editingStyle);
      const url = existingCost
        ? `/api/admin/cities/${city.id}/costs/${existingCost.id}`
        : `/api/admin/cities/${city.id}/costs`;

      const method = existingCost ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          travelStyle: editingStyle,
          accommodation: formData.accommodation * 100,
          food: formData.food * 100,
          transport: formData.transport * 100,
          activities: formData.activities * 100,
          breakfast: formData.breakfast > 0 ? formData.breakfast * 100 : null,
          lunch: formData.lunch > 0 ? formData.lunch * 100 : null,
          dinner: formData.dinner > 0 ? formData.dinner * 100 : null,
          snacks: formData.snacks > 0 ? formData.snacks * 100 : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save costs');
      }

      setSuccess(`Costs saved successfully for ${TRAVEL_STYLE_LABELS[editingStyle as keyof typeof TRAVEL_STYLE_LABELS]}`);
      setEditingStyle(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (costId: string, style: string) => {
    if (!confirm(`Delete ${TRAVEL_STYLE_LABELS[style as keyof typeof TRAVEL_STYLE_LABELS]} costs?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/cities/${city.id}/costs/${costId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete costs');
      }

      setSuccess(`Costs deleted successfully`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const totalDaily = formData.accommodation + formData.food + formData.transport + formData.activities;

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Existing Costs */}
      <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Configured Travel Styles</h2>

        {city.dailyCosts.length === 0 ? (
          <p className="text-gray-900 mb-4">No daily costs configured yet. Add your first travel style below.</p>
        ) : (
          <div className="space-y-4">
            {city.dailyCosts.map(cost => (
              <div key={cost.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {TRAVEL_STYLE_LABELS[cost.travelStyle as keyof typeof TRAVEL_STYLE_LABELS]}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(cost)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cost.id, cost.travelStyle)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-900 font-medium">Accommodation:</span>
                    <span className="ml-2 text-gray-900">{city.currencySymbol}{(cost.accommodation / 100).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-900 font-medium">Food:</span>
                    <span className="ml-2 text-gray-900">{city.currencySymbol}{(cost.food / 100).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-900 font-medium">Transport:</span>
                    <span className="ml-2 text-gray-900">{city.currencySymbol}{(cost.transport / 100).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-900 font-medium">Activities:</span>
                    <span className="ml-2 text-gray-900">{city.currencySymbol}{(cost.activities / 100).toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">Total per day: </span>
                  <span className="text-lg font-bold text-blue-600">
                    {city.currencySymbol}
                    {((cost.accommodation + cost.food + cost.transport + cost.activities) / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New or Edit Form */}
      {!editingStyle ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Travel Style</h2>
          <div className="flex flex-wrap gap-3">
            {TRAVEL_STYLES.map(style => {
              const exists = city.dailyCosts.some(c => c.travelStyle === style);
              if (exists) return null;

              return (
                <button
                  key={style}
                  onClick={() => handleCreate(style)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  + Add {TRAVEL_STYLE_LABELS[style]}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {city.dailyCosts.some(c => c.travelStyle === editingStyle) ? 'Edit' : 'Add'}{' '}
            {TRAVEL_STYLE_LABELS[editingStyle as keyof typeof TRAVEL_STYLE_LABELS]} Costs
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Main Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Accommodation (per night) *
              </label>
              <div className="flex items-center">
                <span className="mr-2 text-gray-900">{city.currencySymbol}</span>
                <input
                  type="number"
                  value={formData.accommodation}
                  onChange={e => setFormData({ ...formData, accommodation: parseFloat(e.target.value) || 0 })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Food & Drinks (per day) *
              </label>
              <div className="flex items-center">
                <span className="mr-2 text-gray-900">{city.currencySymbol}</span>
                <input
                  type="number"
                  value={formData.food}
                  onChange={e => setFormData({ ...formData, food: parseFloat(e.target.value) || 0 })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Transport (per day) *
              </label>
              <div className="flex items-center">
                <span className="mr-2 text-gray-900">{city.currencySymbol}</span>
                <input
                  type="number"
                  value={formData.transport}
                  onChange={e => setFormData({ ...formData, transport: parseFloat(e.target.value) || 0 })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Activities (per day) *
              </label>
              <div className="flex items-center">
                <span className="mr-2 text-gray-900">{city.currencySymbol}</span>
                <input
                  type="number"
                  value={formData.activities}
                  onChange={e => setFormData({ ...formData, activities: parseFloat(e.target.value) || 0 })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>
          </div>

          {/* Optional Breakdown */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Optional: Food Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Breakfast</label>
                <div className="flex items-center">
                  <span className="mr-2 text-gray-900">{city.currencySymbol}</span>
                  <input
                    type="number"
                    value={formData.breakfast}
                    onChange={e => setFormData({ ...formData, breakfast: parseFloat(e.target.value) || 0 })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Lunch</label>
                <div className="flex items-center">
                  <span className="mr-2 text-gray-900">{city.currencySymbol}</span>
                  <input
                    type="number"
                    value={formData.lunch}
                    onChange={e => setFormData({ ...formData, lunch: parseFloat(e.target.value) || 0 })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Dinner</label>
                <div className="flex items-center">
                  <span className="mr-2 text-gray-900">{city.currencySymbol}</span>
                  <input
                    type="number"
                    value={formData.dinner}
                    onChange={e => setFormData({ ...formData, dinner: parseFloat(e.target.value) || 0 })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Snacks</label>
                <div className="flex items-center">
                  <span className="mr-2 text-gray-900">{city.currencySymbol}</span>
                  <input
                    type="number"
                    value={formData.snacks}
                    onChange={e => setFormData({ ...formData, snacks: parseFloat(e.target.value) || 0 })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-900 mb-1">Total Daily Cost</p>
              <p className="text-3xl font-bold text-blue-600">
                {city.currencySymbol}{totalDaily.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : 'Save Costs'}
            </button>
            <button
              type="button"
              onClick={() => setEditingStyle(null)}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-900 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
