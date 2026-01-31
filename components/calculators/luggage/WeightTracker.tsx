'use client';

import { useTranslations } from 'next-intl';

type Props = {
  totalWeight: number; // grams
  weightLimit: number; // grams
  remainingWeight: number; // grams
};

export default function WeightTracker({ totalWeight, weightLimit, remainingWeight }: Props) {
  const t = useTranslations('luggage.tracker');

  const percentage = (totalWeight / weightLimit) * 100;
  const isOverweight = totalWeight > weightLimit;
  const isClose = percentage > 90 && !isOverweight;

  // Color based on weight status
  let barColor = 'bg-green-500';
  let bgColor = 'bg-green-50';
  let borderColor = 'border-green-200';
  let textColor = 'text-green-800';

  if (isOverweight) {
    barColor = 'bg-red-500';
    bgColor = 'bg-red-50';
    borderColor = 'border-red-200';
    textColor = 'text-red-800';
  } else if (isClose) {
    barColor = 'bg-yellow-500';
    bgColor = 'bg-yellow-50';
    borderColor = 'border-yellow-200';
    textColor = 'text-yellow-800';
  }

  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{t('title')}</h3>
        <div className="text-right">
          <p className={`text-2xl font-bold ${textColor}`}>
            {(totalWeight / 1000).toFixed(2)}kg
          </p>
          <p className="text-sm text-gray-600">
            {t('of')} {(weightLimit / 1000).toFixed(0)}kg
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full bg-gray-200 rounded-full h-6 mb-4">
        <div
          className={`${barColor} h-6 rounded-full transition-all duration-500 flex items-center justify-center`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        >
          {percentage > 10 && (
            <span className="text-xs font-semibold text-white">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
        {isOverweight && (
          <div
            className="absolute top-0 right-0 h-6 bg-red-700 opacity-50 rounded-r-full"
            style={{ width: `${percentage - 100}%` }}
          ></div>
        )}
      </div>

      {/* Status Messages */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600">{t('remaining')}</p>
          <p className={`font-semibold ${remainingWeight < 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {remainingWeight < 0 ? '-' : '+'}{Math.abs(remainingWeight / 1000).toFixed(2)}kg
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-600">{t('status')}</p>
          <p className={`font-semibold ${textColor}`}>
            {isOverweight ? t('overweight') : isClose ? t('almostFull') : t('goodToGo')}
          </p>
        </div>
      </div>

      {/* Warning Message */}
      {isOverweight && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
          <p className="text-sm text-red-900 flex items-start">
            <span className="mr-2">⚠️</span>
            <span>{t('overweightWarning')}</span>
          </p>
        </div>
      )}

      {isClose && !isOverweight && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
          <p className="text-sm text-yellow-900 flex items-start">
            <span className="mr-2">💡</span>
            <span>{t('almostFullTip')}</span>
          </p>
        </div>
      )}
    </div>
  );
}
