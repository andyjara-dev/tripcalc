'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type CityCashInfo = {
  id: string;
  cashNeeded: string;
  cardsAccepted: string;
  atmAvailability: string;
  recommendations: string;
  atmFees: string | null;
  bestExchange: string | null;
};

type City = {
  id: string;
  name: string;
  cashInfo: CityCashInfo | null;
};

type Props = {
  city: City;
};

const CASH_NEEDED_OPTIONS = [
  { value: 'low', label: 'Low', description: 'Cash rarely needed, cards work almost everywhere' },
  { value: 'medium', label: 'Medium', description: 'Cash useful for small purchases, cards widely accepted' },
  { value: 'high', label: 'High', description: 'Cash essential, cards only at major establishments' },
];

const CARDS_ACCEPTED_OPTIONS = [
  { value: 'widely', label: 'Widely', description: 'Cards accepted at most places' },
  { value: 'most-places', label: 'Most Places', description: 'Cards accepted at larger establishments' },
  { value: 'limited', label: 'Limited', description: 'Cards only at hotels, restaurants, major shops' },
];

const ATM_AVAILABILITY_OPTIONS = [
  { value: 'everywhere', label: 'Everywhere', description: 'ATMs on every corner' },
  { value: 'common', label: 'Common', description: 'ATMs easy to find in most areas' },
  { value: 'limited', label: 'Limited', description: 'ATMs mainly in central areas' },
];

export default function CashInfoManager({ city }: Props) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(!city.cashInfo);
  const [formData, setFormData] = useState({
    cashNeeded: city.cashInfo?.cashNeeded || 'medium',
    cardsAccepted: city.cashInfo?.cardsAccepted || 'widely',
    atmAvailability: city.cashInfo?.atmAvailability || 'common',
    recommendations: city.cashInfo?.recommendations || '',
    atmFees: city.cashInfo?.atmFees || '',
    bestExchange: city.cashInfo?.bestExchange || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const url = city.cashInfo
        ? `/api/admin/cities/${city.id}/cash-info/${city.cashInfo.id}`
        : `/api/admin/cities/${city.id}/cash-info`;

      const method = city.cashInfo ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cashNeeded: formData.cashNeeded,
          cardsAccepted: formData.cardsAccepted,
          atmAvailability: formData.atmAvailability,
          recommendations: formData.recommendations,
          atmFees: formData.atmFees || null,
          bestExchange: formData.bestExchange || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save cash info');
      }

      setSuccess('Cash info saved successfully');
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!city.cashInfo) return;
    if (!confirm('Delete all cash info for this city?')) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/cities/${city.id}/cash-info/${city.cashInfo.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete cash info');
      }

      setSuccess('Cash info deleted successfully');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

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

      {/* Display Mode */}
      {!isEditing && city.cashInfo && (
        <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Current Cash Info</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
                disabled={loading}
              >
                Delete
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Cash Needed</p>
                <p className="font-semibold text-gray-900 capitalize">{city.cashInfo.cashNeeded}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Cards Accepted</p>
                <p className="font-semibold text-gray-900 capitalize">{city.cashInfo.cardsAccepted.replace('-', ' ')}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">ATM Availability</p>
                <p className="font-semibold text-gray-900 capitalize">{city.cashInfo.atmAvailability}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium text-gray-900 mb-2">Recommendations</h3>
              <p className="text-gray-900 whitespace-pre-line">{city.cashInfo.recommendations}</p>
            </div>

            {city.cashInfo.atmFees && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium text-gray-900 mb-2">ATM Fees</h3>
                <p className="text-gray-900">{city.cashInfo.atmFees}</p>
              </div>
            )}

            {city.cashInfo.bestExchange && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium text-gray-900 mb-2">Best Exchange Options</h3>
                <p className="text-gray-900">{city.cashInfo.bestExchange}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit/Create Form */}
      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {city.cashInfo ? 'Edit' : 'Add'} Cash Info
          </h2>

          <div className="space-y-6 mb-6">
            {/* Cash Needed */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Cash Needed *
              </label>
              <div className="space-y-2">
                {CASH_NEEDED_OPTIONS.map(option => (
                  <label
                    key={option.value}
                    className={`flex items-start p-4 border rounded-lg cursor-pointer ${
                      formData.cashNeeded === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      checked={formData.cashNeeded === option.value}
                      onChange={e => setFormData({ ...formData, cashNeeded: e.target.value })}
                      className="mt-1 mr-3"
                      required
                    />
                    <div>
                      <p className="font-medium text-gray-900">{option.label}</p>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Cards Accepted */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Cards Accepted *
              </label>
              <div className="space-y-2">
                {CARDS_ACCEPTED_OPTIONS.map(option => (
                  <label
                    key={option.value}
                    className={`flex items-start p-4 border rounded-lg cursor-pointer ${
                      formData.cardsAccepted === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      checked={formData.cardsAccepted === option.value}
                      onChange={e => setFormData({ ...formData, cardsAccepted: e.target.value })}
                      className="mt-1 mr-3"
                      required
                    />
                    <div>
                      <p className="font-medium text-gray-900">{option.label}</p>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* ATM Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                ATM Availability *
              </label>
              <div className="space-y-2">
                {ATM_AVAILABILITY_OPTIONS.map(option => (
                  <label
                    key={option.value}
                    className={`flex items-start p-4 border rounded-lg cursor-pointer ${
                      formData.atmAvailability === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={option.value}
                      checked={formData.atmAvailability === option.value}
                      onChange={e => setFormData({ ...formData, atmAvailability: e.target.value })}
                      className="mt-1 mr-3"
                      required
                    />
                    <div>
                      <p className="font-medium text-gray-900">{option.label}</p>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Recommendations *
              </label>
              <textarea
                value={formData.recommendations}
                onChange={e => setFormData({ ...formData, recommendations: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                rows={5}
                placeholder="Detailed recommendations for travelers about cash usage, where to pay with cards, etc."
                required
              />
            </div>

            {/* ATM Fees */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                ATM Fees (Optional)
              </label>
              <textarea
                value={formData.atmFees}
                onChange={e => setFormData({ ...formData, atmFees: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                rows={3}
                placeholder="Information about typical ATM fees in this city"
              />
            </div>

            {/* Best Exchange */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Best Exchange Options (Optional)
              </label>
              <textarea
                value={formData.bestExchange}
                onChange={e => setFormData({ ...formData, bestExchange: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                rows={3}
                placeholder="Where to get the best exchange rates in this city"
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
              {loading ? 'Saving...' : city.cashInfo ? 'Update' : 'Create'} Cash Info
            </button>
            {city.cashInfo && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-900 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
