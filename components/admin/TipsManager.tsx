'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type CityTip = {
  id: string;
  category: string;
  title: string;
  content: string;
  order: number;
};

type City = {
  id: string;
  name: string;
  tips: CityTip[];
};

type Props = {
  city: City;
};

const TIP_CATEGORIES = [
  { value: 'payment', label: '💳 Payment & Money', icon: '💳' },
  { value: 'safety', label: '🛡️ Safety & Security', icon: '🛡️' },
  { value: 'culture', label: '🎭 Culture & Customs', icon: '🎭' },
  { value: 'language', label: '🗣️ Language & Communication', icon: '🗣️' },
  { value: 'transport', label: '🚇 Transport Tips', icon: '🚇' },
  { value: 'food', label: '🍽️ Food & Dining', icon: '🍽️' },
  { value: 'weather', label: '🌤️ Weather & Climate', icon: '🌤️' },
  { value: 'general', label: '📌 General Tips', icon: '📌' },
];

export default function TipsManager({ city }: Props) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: 'general',
    title: '',
    content: '',
    order: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      category: 'general',
      title: '',
      content: '',
      order: city.tips.length,
    });
    setError(null);
    setSuccess(null);
  };

  const handleEdit = (tip: CityTip) => {
    setIsAdding(false);
    setEditingId(tip.id);
    setFormData({
      category: tip.category,
      title: tip.title,
      content: tip.content,
      order: tip.order,
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
      const url = editingId
        ? `/api/admin/cities/${city.id}/tips/${editingId}`
        : `/api/admin/cities/${city.id}/tips`;

      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save tip');
      }

      setSuccess(`Tip ${editingId ? 'updated' : 'created'} successfully`);
      setIsAdding(false);
      setEditingId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tipId: string, title: string) => {
    if (!confirm(`Delete tip "${title}"?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/cities/${city.id}/tips/${tipId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete tip');
      }

      setSuccess('Tip deleted successfully');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Group tips by category
  const groupedTips = city.tips.reduce((acc, tip) => {
    if (!acc[tip.category]) {
      acc[tip.category] = [];
    }
    acc[tip.category].push(tip);
    return acc;
  }, {} as Record<string, CityTip[]>);

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

      {/* Add Button */}
      {!isAdding && !editingId && (
        <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <button
            onClick={handleAdd}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            + Add Tip
          </button>
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit' : 'Add'} Tip
          </h2>

          <div className="space-y-4 mb-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              >
                {TIP_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="e.g., Credit cards widely accepted, Tipping is not expected"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                rows={5}
                placeholder="Detailed explanation or advice for travelers"
                required
              />
            </div>

            {/* Order */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                min="0"
              />
              <p className="text-xs text-gray-600 mt-1">Lower numbers appear first</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : editingId ? 'Update' : 'Add'} Tip
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-900 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Existing Tips */}
      <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tips & Advice ({city.tips.length})</h2>

        {city.tips.length === 0 ? (
          <p className="text-gray-900">No tips configured yet. Add your first tip above.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTips).map(([category, tips]) => {
              const categoryInfo = TIP_CATEGORIES.find(c => c.value === category);
              return (
                <div key={category} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    {categoryInfo?.icon} {categoryInfo?.label || category}
                  </h3>
                  <div className="space-y-3">
                    {tips.map(tip => (
                      <div key={tip.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">{tip.title}</h4>
                            <p className="text-sm text-gray-900 whitespace-pre-line">{tip.content}</p>
                            <p className="text-xs text-gray-600 mt-2">Order: {tip.order}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEdit(tip)}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(tip.id, tip.title)}
                              className="text-sm text-red-600 hover:text-red-800 font-medium whitespace-nowrap"
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
