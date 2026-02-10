/**
 * WeatherAlertModal
 * Shows detailed weather alerts grouped by severity
 */

'use client';

import { useTranslations } from 'next-intl';
import type { WeatherAlert, AlertLevel } from '@/lib/weather/weather-alerts';
import {
  getAlertColor,
  getAlertIcon,
  getAlertLevelKey,
} from '@/lib/weather/weather-alerts';

interface WeatherAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: WeatherAlert[];
  cityName: string;
}

export function WeatherAlertModal({
  isOpen,
  onClose,
  alerts,
  cityName,
}: WeatherAlertModalProps) {
  const t = useTranslations();

  if (!isOpen) return null;

  // Group alerts by level
  const redAlerts = alerts.filter((a) => a.level === 'red');
  const orangeAlerts = alerts.filter((a) => a.level === 'orange');
  const yellowAlerts = alerts.filter((a) => a.level === 'yellow');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>⚠️</span>
                <span>{t('weather.weatherAlerts')}</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {cityName} • {alerts.length}{' '}
                {alerts.length === 1 ? t('weather.alert') : t('weather.alerts')}{' '}
                {t('weather.alertsDetected')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl leading-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Red alerts (Severe) */}
          {redAlerts.length > 0 && (
            <AlertSection level="red" title={t('weather.severeWeather')} alerts={redAlerts} />
          )}

          {/* Orange alerts (Dangerous) */}
          {orangeAlerts.length > 0 && (
            <AlertSection
              level="orange"
              title={t('weather.dangerousWeather')}
              alerts={orangeAlerts}
            />
          )}

          {/* Yellow alerts (Caution) */}
          {yellowAlerts.length > 0 && (
            <AlertSection
              level="yellow"
              title={t('weather.cautionWeather')}
              alerts={yellowAlerts}
            />
          )}

          {/* General advice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>💡 {t('weather.recommendation')}:</strong> {t('weather.alertAdvice')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
          >
            {t('weather.understood')}
          </button>
        </div>
      </div>
    </div>
  );
}

interface AlertSectionProps {
  level: AlertLevel;
  title: string;
  alerts: WeatherAlert[];
}

function AlertSection({ level, title, alerts }: AlertSectionProps) {
  const t = useTranslations();

  return (
    <div>
      <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">{title}</h3>
      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <div
            key={i}
            className={`p-4 rounded-lg border-2 ${getAlertColor(alert.level)} transition-all`}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl flex-shrink-0" role="img" aria-label={alert.type}>
                {getAlertIcon(alert.type)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h4 className="font-bold text-base">{alert.title}</h4>
                  <span className="text-sm opacity-75 flex-shrink-0">
                    {new Date(alert.date).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-sm mb-2 leading-relaxed">{alert.description}</p>

                {/* Temperature or precipitation info */}
                {(alert.tempMin !== undefined ||
                  alert.tempMax !== undefined ||
                  alert.precipitation !== undefined) && (
                  <div className="flex gap-3 text-xs mb-2 flex-wrap">
                    {alert.tempMin !== undefined && (
                      <span className="px-2 py-1 bg-white/50 dark:bg-black/20 rounded">
                        🥶 Min: {alert.tempMin}°C
                      </span>
                    )}
                    {alert.tempMax !== undefined && (
                      <span className="px-2 py-1 bg-white/50 dark:bg-black/20 rounded">
                        🔥 Max: {alert.tempMax}°C
                      </span>
                    )}
                    {alert.precipitation !== undefined && alert.precipitation > 0 && (
                      <span className="px-2 py-1 bg-white/50 dark:bg-black/20 rounded">
                        💧 {alert.precipitation}%
                      </span>
                    )}
                  </div>
                )}

                {/* Recommendation */}
                <div className="bg-white/50 dark:bg-black/20 rounded p-3 text-sm">
                  <strong>{t('weather.recommendation')}:</strong> {alert.recommendation}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
