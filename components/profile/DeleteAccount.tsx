'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function DeleteAccount() {
  const t = useTranslations('profile.dangerZone');
  const router = useRouter();

  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (confirmText !== t('confirmText')) {
      setError(`Please type "${t('confirmText')}" to confirm`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/profile/delete', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      // Sign out and redirect to home
      await signOut({ callbackUrl: '/' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setLoading(false);
    }
  };

  return (
    <div className="bg-red-50 rounded-lg shadow p-6 border border-red-200">
      <h2 className="text-xl font-semibold text-red-800 mb-2">{t('title')}</h2>
      <p className="text-red-700 mb-4">{t('deleteWarning')}</p>

      <div className="space-y-3">
        <div>
          <label htmlFor="confirm-delete" className="block text-sm font-medium text-red-800 mb-1">
            {t('confirmDelete')}
          </label>
          <input
            type="text"
            id="confirm-delete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={t('confirmText')}
            className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500"
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <button
          onClick={handleDelete}
          disabled={loading || confirmText !== t('confirmText')}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
        >
          {loading ? t('deleting') : t('deleteButton')}
        </button>
      </div>
    </div>
  );
}
