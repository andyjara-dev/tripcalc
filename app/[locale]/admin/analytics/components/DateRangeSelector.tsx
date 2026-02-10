'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface DateRangeSelectorProps {
  from: Date;
  to: Date;
}

export function DateRangeSelector({ from, to }: DateRangeSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handlePresetClick = (days: number) => {
    const newTo = new Date();
    const newFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const params = new URLSearchParams(searchParams.toString());
    params.set('from', formatDate(newFrom));
    params.set('to', formatDate(newTo));

    router.push(`?${params.toString()}`);
  };

  const handleCustomChange = (type: 'from' | 'to', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(type, value);
    router.push(`?${params.toString()}`);
  };

  const presets = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'Last year', days: 365 },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Date Range
      </h2>

      {/* Presets */}
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((preset) => (
          <button
            key={preset.days}
            onClick={() => handlePresetClick(preset.days)}
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom date range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            From
          </label>
          <input
            type="date"
            value={formatDate(from)}
            onChange={(e) => handleCustomChange('from', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            To
          </label>
          <input
            type="date"
            value={formatDate(to)}
            onChange={(e) => handleCustomChange('to', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
}
