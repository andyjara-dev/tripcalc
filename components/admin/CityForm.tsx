'use client';

/**
 * City Form Component
 * Comprehensive form for creating/editing city data
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type CityFormData = {
  id: string;
  name: string;
  country: string;
  region?: string;
  currency: string;
  currencySymbol: string;
  language: string;
  timezone?: string;
  population?: number;
  touristSeason?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  imageUrl?: string;
  imageCredit?: string;
  isPublished: boolean;
  lastUpdated: string;
};

type CityFormProps = {
  city?: any; // Existing city data (for edit mode)
  mode: 'create' | 'edit';
};

export default function CityForm({ city, mode }: CityFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get current month in YYYY-MM format
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [formData, setFormData] = useState<CityFormData>(() => {
    if (city) {
      return {
        id: city.id,
        name: city.name,
        country: city.country,
        region: city.region || '',
        currency: city.currency,
        currencySymbol: city.currencySymbol,
        language: city.language,
        timezone: city.timezone || '',
        population: city.population || undefined,
        touristSeason: city.touristSeason || '',
        description: city.description || '',
        metaTitle: city.metaTitle || '',
        metaDescription: city.metaDescription || '',
        imageUrl: city.imageUrl || '',
        imageCredit: city.imageCredit || '',
        isPublished: city.isPublished,
        lastUpdated: city.lastUpdated || getCurrentMonth(),
      };
    }

    return {
      id: '',
      name: '',
      country: '',
      region: '',
      currency: 'EUR',
      currencySymbol: '€',
      language: '',
      timezone: '',
      population: undefined,
      touristSeason: '',
      description: '',
      metaTitle: '',
      metaDescription: '',
      imageUrl: '',
      imageCredit: '',
      isPublished: false,
      lastUpdated: getCurrentMonth(),
    };
  });

  // Auto-generate ID from name
  const handleNameChange = (name: string) => {
    setFormData((prev) => {
      // Only auto-generate ID in create mode and if ID hasn't been manually edited
      if (mode === 'create' && !prev.id) {
        const id = name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();

        return { ...prev, name, id };
      }

      return { ...prev, name };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = mode === 'create' ? '/api/admin/cities' : `/api/admin/cities/${city.id}`;

      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save city');
      }

      // Redirect to cities list
      router.push('/admin/cities');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currencyOptions = [
    { code: 'EUR', symbol: '€' },
    { code: 'USD', symbol: '$' },
    { code: 'GBP', symbol: '£' },
    { code: 'JPY', symbol: '¥' },
    { code: 'AUD', symbol: 'A$' },
    { code: 'CAD', symbol: 'C$' },
    { code: 'CHF', symbol: 'CHF' },
    { code: 'CNY', symbol: '¥' },
    { code: 'MXN', symbol: 'MX$' },
    { code: 'BRL', symbol: 'R$' },
  ];

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="e.g., Barcelona"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Slug (ID) *
            </label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              required
              disabled={mode === 'edit'}
              pattern="[a-z0-9-]+"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white disabled:bg-gray-100 disabled:text-gray-600"
              placeholder="e.g., barcelona"
            />
            <p className="mt-1 text-xs text-gray-500">
              Lowercase letters, numbers, and hyphens only
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="e.g., Spain"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <input
              type="text"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="e.g., Europe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language(s) *
            </label>
            <input
              type="text"
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="e.g., Spanish, Catalan"
            />
          </div>
        </div>
      </div>

      {/* Currency */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Currency</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency Code *
            </label>
            <select
              value={formData.currency}
              onChange={(e) => {
                const option = currencyOptions.find((c) => c.code === e.target.value);
                setFormData({
                  ...formData,
                  currency: e.target.value,
                  currencySymbol: option?.symbol || '',
                });
              }}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            >
              {currencyOptions.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.code} - {curr.symbol}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency Symbol *
            </label>
            <input
              type="text"
              value={formData.currencySymbol}
              onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
              required
              maxLength={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="e.g., €"
            />
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Metadata</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <input
              type="text"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="e.g., Europe/Madrid"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Population
            </label>
            <input
              type="number"
              value={formData.population || ''}
              onChange={(e) =>
                setFormData({ ...formData, population: e.target.value ? parseInt(e.target.value) : undefined })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="e.g., 1600000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tourist Season
            </label>
            <input
              type="text"
              value={formData.touristSeason}
              onChange={(e) => setFormData({ ...formData, touristSeason: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="e.g., Year-round, Summer, Winter"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="Brief description of the city for internal use"
            />
          </div>
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">SEO</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Title
            </label>
            <input
              type="text"
              value={formData.metaTitle}
              onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
              maxLength={60}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="e.g., Barcelona Travel Costs - Daily Budget Calculator"
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.metaTitle?.length || 0}/60 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description
            </label>
            <textarea
              value={formData.metaDescription}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              rows={3}
              maxLength={160}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="SEO description for search engines"
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.metaDescription?.length || 0}/160 characters
            </p>
          </div>
        </div>
      </div>

      {/* Media */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Media</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image Credit
            </label>
            <input
              type="text"
              value={formData.imageCredit}
              onChange={(e) => setFormData({ ...formData, imageCredit: e.target.value })}
              maxLength={200}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="Photo by Author Name / Source"
            />
          </div>
        </div>
      </div>

      {/* Publishing */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Publishing</h2>

        <div className="space-y-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Publish this city (make it visible on the site)
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Updated *
            </label>
            <input
              type="text"
              value={formData.lastUpdated}
              onChange={(e) => setFormData({ ...formData, lastUpdated: e.target.value })}
              required
              pattern="\d{4}-\d{2}"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="YYYY-MM (e.g., 2026-01)"
            />
            <p className="mt-1 text-xs text-gray-500">Format: YYYY-MM</p>
          </div>
        </div>
      </div>

      {/* Note about additional data */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> After creating the city, you'll need to add daily costs, transport options, tips, and other data through the edit page.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create City' : 'Update City'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
