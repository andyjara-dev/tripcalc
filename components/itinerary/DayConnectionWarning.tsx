'use client';

/**
 * DayConnectionWarning Component
 * Warning banner shown between disconnected days
 * Allows user to sync locations or dismiss
 */

import { useTranslations } from 'next-intl';

interface DayConnectionWarningProps {
  previousDay: number;
  currentDay: number;
  lastLocation: string;
  nextLocation: string;
  onSync: (mode: 'forward' | 'backward') => void;
  onDismiss: () => void;
}

export default function DayConnectionWarning({
  previousDay,
  currentDay,
  lastLocation,
  nextLocation,
  onSync,
  onDismiss,
}: DayConnectionWarningProps) {
  const t = useTranslations('itinerary');

  // Truncate long addresses
  const truncate = (text: string, maxLength: number = 40) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <div className="my-6 mx-4 lg:mx-0">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg shadow-sm">
        <div className="flex items-start gap-3">
          {/* Warning Icon */}
          <div className="flex-shrink-0">
            <span className="text-2xl">⚠️</span>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h4 className="text-sm font-bold text-yellow-800 mb-2">
              {t('dayDisconnected', { dayNumber: currentDay, previousDay })}
            </h4>

            <div className="text-xs text-yellow-700 space-y-1 mb-3">
              <div className="flex items-start gap-2">
                <span className="font-medium">Day {previousDay} ends:</span>
                <span className="italic">{truncate(lastLocation)}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">Day {currentDay} starts:</span>
                <span className="italic">{truncate(nextLocation)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onSync('forward')}
                className="px-3 py-1.5 text-xs font-medium text-yellow-900 bg-yellow-200 hover:bg-yellow-300 rounded-lg transition-colors"
                title="Update Day 2 start to match Day 1 end"
              >
                {t('syncTo', { location: truncate(lastLocation, 20) })} →
              </button>
              <button
                onClick={() => onSync('backward')}
                className="px-3 py-1.5 text-xs font-medium text-yellow-900 bg-yellow-200 hover:bg-yellow-300 rounded-lg transition-colors"
                title="Update Day 1 end to match Day 2 start"
              >
                ← {t('syncTo', { location: truncate(nextLocation, 20) })}
              </button>
              <button
                onClick={onDismiss}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                {t('dismissWarning')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
