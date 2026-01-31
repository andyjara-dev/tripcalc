'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type CityTransport = {
  id: string;
  type: string;
  name: string;
  price: number;
  priceNote: string | null;
  description: string | null;
  tips: string | null;
  bookingUrl: string | null;
};

type City = {
  id: string;
  name: string;
  currency: string;
  currencySymbol: string;
  transport: CityTransport[];
};

type Props = {
  city: City;
};

const TRANSPORT_TYPES = [
  { value: 'metro', label: '🚇 Metro', icon: '🚇' },
  { value: 'taxi', label: '🚕 Taxi', icon: '🚕' },
  { value: 'uber', label: '🚗 Uber/Ride-share', icon: '🚗' },
  { value: 'bus', label: '🚌 Bus', icon: '🚌' },
  { value: 'tram', label: '🚊 Tram', icon: '🚊' },
  { value: 'train', label: '🚆 Train', icon: '🚆' },
  { value: 'ferry', label: '⛴️ Ferry', icon: '⛴️' },
  { value: 'bike', label: '🚲 Bike rental', icon: '🚲' },
  { value: 'scooter', label: '🛴 Scooter', icon: '🛴' },
  { value: 'other', label: '🎫 Other', icon: '🎫' },
];

export default function TransportManager({ city }: Props) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'metro',
    name: '',
    price: 0,
    priceNote: '',
    description: '',
    tips: '',
    bookingUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      type: 'metro',
      name: '',
      price: 0,
      priceNote: '',
      description: '',
      tips: '',
      bookingUrl: '',
    });
    setError(null);
    setSuccess(null);
  };

  const handleEdit = (transport: CityTransport) => {
    setIsAdding(false);
    setEditingId(transport.id);
    setFormData({
      type: transport.type,
      name: transport.name,
      price: Math.round(transport.price / 100 * 100) / 100,
      priceNote: transport.priceNote || '',
      description: transport.description || '',
      tips: transport.tips || '',
      bookingUrl: transport.bookingUrl || '',
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
        ? `/api/admin/cities/${city.id}/transport/${editingId}`
        : `/api/admin/cities/${city.id}/transport`;

      const method = editingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          name: formData.name,
          price: Math.round(formData.price * 100),
          priceNote: formData.priceNote || null,
          description: formData.description || null,
          tips: formData.tips || null,
          bookingUrl: formData.bookingUrl || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save transport option');
      }

      setSuccess(`Transport option ${editingId ? 'updated' : 'created'} successfully`);
      setIsAdding(false);
      setEditingId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (transportId: string, name: string) => {
    if (!confirm(`Delete transport option "${name}"?`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/cities/${city.id}/transport/${transportId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete transport option');
      }

      setSuccess('Transport option deleted successfully');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Group transport options by type
  const groupedTransport = city.transport.reduce((acc, t) => {
    if (!acc[t.type]) {
      acc[t.type] = [];
    }
    acc[t.type].push(t);
    return acc;
  }, {} as Record<string, CityTransport[]>);

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
            + Add Transport Option
          </button>
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit' : 'Add'} Transport Option
          </h2>

          <div className="space-y-4 mb-6">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Transport Type *
              </label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
              >
                {TRANSPORT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="e.g., Metro Single Ticket, Uber Pool, T-10 Card"
                required
              />
            </div>

            {/* Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Price *
                </label>
                <div className="flex items-center">
                  <span className="mr-2 text-gray-900">{city.currencySymbol}</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Price Note
                </label>
                <input
                  type="text"
                  value={formData.priceNote}
                  onChange={e => setFormData({ ...formData, priceNote: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="e.g., Per ride, Per km, Base fare"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                rows={3}
                placeholder="Brief description of this transport option"
              />
            </div>

            {/* Tips */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Tips
              </label>
              <textarea
                value={formData.tips}
                onChange={e => setFormData({ ...formData, tips: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                rows={2}
                placeholder="Helpful tips for using this transport"
              />
            </div>

            {/* Booking URL */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Booking URL
              </label>
              <input
                type="url"
                value={formData.bookingUrl}
                onChange={e => setFormData({ ...formData, bookingUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : editingId ? 'Update' : 'Add'} Transport Option
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

      {/* Existing Transport Options */}
      <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Transport Options ({city.transport.length})</h2>

        {city.transport.length === 0 ? (
          <p className="text-gray-900">No transport options configured yet. Add your first option above.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedTransport).map(([type, options]) => {
              const typeInfo = TRANSPORT_TYPES.find(t => t.value === type);
              return (
                <div key={type} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    {typeInfo?.icon} {typeInfo?.label || type}
                  </h3>
                  <div className="space-y-3">
                    {options.map(transport => (
                      <div key={transport.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{transport.name}</h4>
                            <p className="text-sm text-gray-900">
                              {city.currencySymbol}{(transport.price / 100).toFixed(2)}
                              {transport.priceNote && <span className="text-gray-600"> ({transport.priceNote})</span>}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(transport)}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(transport.id, transport.name)}
                              className="text-sm text-red-600 hover:text-red-800 font-medium"
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        {transport.description && (
                          <p className="text-sm text-gray-900 mb-1">{transport.description}</p>
                        )}
                        {transport.tips && (
                          <p className="text-sm text-gray-600 italic">💡 {transport.tips}</p>
                        )}
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
