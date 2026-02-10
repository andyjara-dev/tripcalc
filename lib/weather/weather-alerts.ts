/**
 * Weather Alerts Detection
 * Detects extreme weather conditions and generates alerts
 */

import type { WeatherDay } from './open-meteo';

export type AlertLevel = 'red' | 'orange' | 'yellow';
export type AlertType = 'storm' | 'cold' | 'heat' | 'rain' | 'snow' | 'wind';

export interface WeatherAlert {
  date: string;
  level: AlertLevel;
  type: AlertType;
  weatherCode: number;
  title: string;
  description: string;
  recommendation: string;
  tempMin?: number;
  tempMax?: number;
  precipitation?: number;
}

/**
 * Detect weather alerts from forecast data
 */
export function detectWeatherAlerts(days: WeatherDay[]): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  days.forEach((day) => {
    // Severe Thunderstorms (RED ALERT)
    if (day.weatherCode >= 95 && day.weatherCode <= 99) {
      const hasHail = day.weatherCode >= 96;
      alerts.push({
        date: day.date,
        level: 'red',
        type: 'storm',
        weatherCode: day.weatherCode,
        title: 'Severe Thunderstorm',
        description: hasHail
          ? `Thunderstorm with ${day.weatherCode === 99 ? 'heavy' : 'slight'} hail expected`
          : 'Severe thunderstorm with strong winds expected',
        recommendation: 'Stay indoors. Avoid travel if possible. Secure loose objects outdoors.',
        precipitation: day.precipitationProb,
      });
    }

    // Extreme Cold (RED/ORANGE ALERT)
    if (day.tempMin < 0) {
      const level: AlertLevel = day.tempMin < -10 ? 'red' : day.tempMin < -5 ? 'orange' : 'yellow';
      alerts.push({
        date: day.date,
        level,
        type: 'cold',
        weatherCode: day.weatherCode,
        title: level === 'red' ? 'Extreme Cold Warning' : 'Cold Weather Advisory',
        description: `Temperature will drop to ${day.tempMin}°C${
          day.tempMin < -10 ? ' with severe frost' : ''
        }`,
        recommendation:
          level === 'red'
            ? 'Extreme cold. Avoid prolonged outdoor exposure. Dress in multiple layers. Protect face and extremities.'
            : 'Dress warmly in layers. Protect exposed skin. Limit time outdoors.',
        tempMin: day.tempMin,
      });
    }

    // Extreme Heat (RED/ORANGE ALERT)
    if (day.tempMax > 35) {
      const level: AlertLevel = day.tempMax > 42 ? 'red' : day.tempMax > 38 ? 'orange' : 'yellow';
      alerts.push({
        date: day.date,
        level,
        type: 'heat',
        weatherCode: day.weatherCode,
        title: level === 'red' ? 'Extreme Heat Warning' : 'Heat Advisory',
        description: `Temperature will reach ${day.tempMax}°C${
          level === 'red' ? ' with dangerous heat index' : ''
        }`,
        recommendation:
          level === 'red'
            ? 'Dangerous heat. Stay indoors with AC. Drink water frequently. Avoid strenuous activities. Check on vulnerable people.'
            : 'Stay hydrated. Avoid midday sun. Seek shade or AC. Wear light clothing.',
        tempMax: day.tempMax,
      });
    }

    // Heavy Rain/Freezing Rain (RED/ORANGE ALERT)
    if ([65, 67, 82].includes(day.weatherCode)) {
      const isFreezing = day.weatherCode === 67;
      const isViolent = day.weatherCode === 82;
      const level: AlertLevel = isFreezing || isViolent ? 'red' : 'orange';

      alerts.push({
        date: day.date,
        level,
        type: 'rain',
        weatherCode: day.weatherCode,
        title: isFreezing
          ? 'Freezing Rain Warning'
          : isViolent
          ? 'Violent Rain Showers'
          : 'Heavy Rain Warning',
        description: isFreezing
          ? 'Freezing rain creating dangerous ice conditions'
          : isViolent
          ? 'Violent rain showers with potential flooding'
          : day.weatherDescription,
        recommendation: isFreezing
          ? 'Extremely dangerous conditions. Avoid all travel. Roads and surfaces will be icy.'
          : 'Flash flooding possible. Avoid low-lying areas. Do not drive through flooded roads.',
        precipitation: day.precipitationProb,
      });
    }

    // Heavy Snow (RED/ORANGE ALERT)
    if ([75, 77, 86].includes(day.weatherCode)) {
      const level: AlertLevel = [77, 86].includes(day.weatherCode) ? 'red' : 'orange';
      alerts.push({
        date: day.date,
        level,
        type: 'snow',
        weatherCode: day.weatherCode,
        title: level === 'red' ? 'Blizzard Warning' : 'Heavy Snow Warning',
        description:
          level === 'red'
            ? 'Heavy snowfall with blizzard conditions expected'
            : 'Heavy snowfall expected',
        recommendation:
          level === 'red'
            ? 'Blizzard conditions. Avoid all travel. Roads may be impassable. Stock emergency supplies.'
            : 'Heavy snow expected. Roads may be difficult. Check transport schedules. Allow extra travel time.',
        precipitation: day.precipitationProb,
      });
    }

    // Moderate conditions with high precipitation (YELLOW ALERT)
    if (
      [63, 73].includes(day.weatherCode) &&
      day.precipitationProb > 70 &&
      !alerts.some((a) => a.date === day.date)
    ) {
      const isSnow = day.weatherCode === 73;
      alerts.push({
        date: day.date,
        level: 'yellow',
        type: isSnow ? 'snow' : 'rain',
        weatherCode: day.weatherCode,
        title: isSnow ? 'Snow Advisory' : 'Rain Advisory',
        description: `${isSnow ? 'Moderate snow' : 'Moderate rain'} with ${
          day.precipitationProb
        }% probability`,
        recommendation: isSnow
          ? 'Some snow accumulation possible. Drive carefully if traveling.'
          : 'Bring umbrella. Roads may be slippery.',
        precipitation: day.precipitationProb,
      });
    }
  });

  // Sort by severity (red first) and then by date
  return alerts.sort((a, b) => {
    const levelOrder = { red: 0, orange: 1, yellow: 2 };
    if (levelOrder[a.level] !== levelOrder[b.level]) {
      return levelOrder[a.level] - levelOrder[b.level];
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
}

/**
 * Get CSS classes for alert level
 */
export function getAlertColor(level: AlertLevel): string {
  switch (level) {
    case 'red':
      return 'bg-red-50 border-red-500 text-red-900 dark:bg-red-900/20 dark:border-red-500 dark:text-red-200';
    case 'orange':
      return 'bg-orange-50 border-orange-500 text-orange-900 dark:bg-orange-900/20 dark:border-orange-500 dark:text-orange-200';
    case 'yellow':
      return 'bg-yellow-50 border-yellow-500 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-500 dark:text-yellow-200';
  }
}

/**
 * Get badge color for alert count
 */
export function getAlertBadgeColor(level: AlertLevel): string {
  switch (level) {
    case 'red':
      return 'bg-red-500 text-white';
    case 'orange':
      return 'bg-orange-500 text-white';
    case 'yellow':
      return 'bg-yellow-500 text-white';
  }
}

/**
 * Get emoji icon for alert type
 */
export function getAlertIcon(type: AlertType): string {
  switch (type) {
    case 'storm':
      return '⛈️';
    case 'cold':
      return '🥶';
    case 'heat':
      return '🔥';
    case 'rain':
      return '🌧️';
    case 'snow':
      return '❄️';
    case 'wind':
      return '💨';
  }
}

/**
 * Get alert level label translation key
 */
export function getAlertLevelKey(level: AlertLevel): string {
  switch (level) {
    case 'red':
      return 'weather.severeWeather';
    case 'orange':
      return 'weather.dangerousWeather';
    case 'yellow':
      return 'weather.cautionWeather';
  }
}

/**
 * Check if a day has any alerts
 */
export function hasAlert(alerts: WeatherAlert[], date: string): boolean {
  return alerts.some((a) => a.date === date);
}

/**
 * Get highest alert level for a specific date
 */
export function getHighestAlertLevel(
  alerts: WeatherAlert[],
  date: string
): AlertLevel | null {
  const dayAlerts = alerts.filter((a) => a.date === date);
  if (dayAlerts.length === 0) return null;

  if (dayAlerts.some((a) => a.level === 'red')) return 'red';
  if (dayAlerts.some((a) => a.level === 'orange')) return 'orange';
  return 'yellow';
}
