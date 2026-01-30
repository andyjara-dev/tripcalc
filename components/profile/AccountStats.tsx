'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface Stats {
  totalTrips: number;
  sharedTrips: number;
  totalExpenses: number;
}

export default function AccountStats() {
  const t = useTranslations('profile.stats');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading stats:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-10 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-3xl font-bold text-blue-600">{stats.totalTrips}</div>
        <div className="text-gray-600 mt-1">{t('totalTrips')}</div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-3xl font-bold text-green-600">{stats.sharedTrips}</div>
        <div className="text-gray-600 mt-1">{t('sharedTrips')}</div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-3xl font-bold text-purple-600">{stats.totalExpenses}</div>
        <div className="text-gray-600 mt-1">{t('totalExpenses')}</div>
      </div>
    </div>
  );
}
