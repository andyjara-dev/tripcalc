'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { WeatherForecast } from '@/lib/weather/open-meteo';
import { WeatherAlertModal } from './WeatherAlertModal';
import {
  detectWeatherAlerts,
  getAlertBadgeColor,
  getHighestAlertLevel,
  type WeatherAlert,
} from '@/lib/weather/weather-alerts';
import { useAnalytics } from '@/hooks/useAnalytics';

interface WeatherCardProps {
  cityId: string;
  startDate: Date | null;
  endDate: Date | null;
}

export function WeatherCard({ cityId, startDate, endDate }: WeatherCardProps) {
  const t = useTranslations('weather');
  const { trackEvent } = useAnalytics();
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch if dates are missing
    if (!startDate || !endDate) {
      setLoading(false);
      return;
    }

    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Format dates as YYYY-MM-DD
        const start = startDate.toISOString().split('T')[0];
        const end = endDate.toISOString().split('T')[0];

        // Build API URL
        const params = new URLSearchParams({
          cityId,
          startDate: start,
          endDate: end,
        });

        const response = await fetch(`/api/weather?${params}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Weather API error: ${response.status}`);
        }

        const data = await response.json();
        setWeather(data);

        // Detect weather alerts
        const detectedAlerts = detectWeatherAlerts(data.days);
        setAlerts(detectedAlerts);

        // Track weather card view
        trackEvent('weather_card_viewed', {
          cityId,
          days: data.days.length,
          hasAlerts: detectedAlerts.length > 0,
          alertCount: detectedAlerts.length,
        });

        // Track if alerts are detected
        if (detectedAlerts.length > 0) {
          trackEvent('weather_alert_shown', {
            cityId,
            alertCount: detectedAlerts.length,
            maxLevel: detectedAlerts[0].level,
            alertTypes: [...new Set(detectedAlerts.map((a) => a.type))],
          });
        }
      } catch (err) {
        console.error('Failed to fetch weather:', err);
        setError(err instanceof Error ? err.message : 'Failed to load weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [cityId, startDate, endDate, trackEvent]);

  // Don't render if no dates
  if (!startDate || !endDate) {
    return null;
  }

  // Show error message if weather fetch failed
  if (error) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-yellow-800 mb-1">
              {t('errorTitle') || 'Weather Forecast Unavailable'}
            </h3>
            <p className="text-sm text-yellow-700">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Success state
  if (!weather || weather.days.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌤️</span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('title')}
          </h3>
        </div>

        {/* Weather alerts badge */}
        {alerts.length > 0 && (
          <button
            onClick={() => {
              setShowAlertModal(true);
              trackEvent('weather_alert_clicked', { cityId, alertCount: alerts.length });
            }}
            className={`flex items-center gap-2 px-3 py-1 rounded-full border-2 ${getAlertBadgeColor(
              alerts[0].level
            )} hover:opacity-80 transition-opacity cursor-pointer`}
          >
            <span className="text-lg">⚠️</span>
            <span className="font-semibold text-sm">
              {alerts.length} {alerts.length === 1 ? t('alert') : t('alerts')}
            </span>
          </button>
        )}
      </div>

      {/* Weather days */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {weather.days.map((day) => {
          const date = new Date(day.date);
          const formattedDate = date.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });

          const alertLevel = getHighestAlertLevel(alerts, day.date);
          const hasAlert = alertLevel !== null;

          return (
            <div
              key={day.date}
              className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                hasAlert
                  ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700'
                  : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {/* Weather icon */}
              <div className="flex-shrink-0 relative">
                <span className="text-4xl" role="img" aria-label={day.weatherDescription}>
                  {day.weatherIcon}
                </span>
                {hasAlert && (
                  <div className="absolute -top-1 -right-1">
                    <span className="text-lg">⚠️</span>
                  </div>
                )}
              </div>

              {/* Date and description */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-white">
                  {formattedDate}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {day.weatherDescription}
                </div>
              </div>

              {/* Temperature and precipitation */}
              <div className="flex-shrink-0 text-right">
                <div className="font-bold text-gray-900 dark:text-white">
                  {day.tempMax}° / {day.tempMin}°
                </div>
                {day.precipitationProb > 0 && (
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    💧 {day.precipitationProb}%
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {t('poweredBy')}{' '}
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Open-Meteo
          </a>
        </p>
      </div>

      {/* Weather Alert Modal */}
      <WeatherAlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        alerts={alerts}
        cityName={weather.city}
      />
    </div>
  );
}
