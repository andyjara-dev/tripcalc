/**
 * Open-Meteo Weather API Integration
 * Free weather API with historical data (80+ years) and 16-day forecast
 * No API key required, 10,000 calls/day
 * https://open-meteo.com/
 */

export interface WeatherDay {
  date: string; // ISO date (YYYY-MM-DD)
  tempMax: number; // °C
  tempMin: number; // °C
  precipitationProb: number; // 0-100%
  weatherCode: number; // WMO code
  weatherIcon: string; // Emoji
  weatherDescription: string; // Human-readable
}

export interface WeatherForecast {
  city: string;
  latitude: number;
  longitude: number;
  days: WeatherDay[];
}

/**
 * WMO Weather Interpretation Codes
 * https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
 */
const WMO_CODES: Record<number, { icon: string; description: string }> = {
  0: { icon: '☀️', description: 'Clear sky' },
  1: { icon: '🌤️', description: 'Mainly clear' },
  2: { icon: '⛅', description: 'Partly cloudy' },
  3: { icon: '☁️', description: 'Overcast' },
  45: { icon: '🌫️', description: 'Foggy' },
  48: { icon: '🌫️', description: 'Depositing rime fog' },
  51: { icon: '🌦️', description: 'Light drizzle' },
  53: { icon: '🌦️', description: 'Moderate drizzle' },
  55: { icon: '🌧️', description: 'Dense drizzle' },
  56: { icon: '🌧️', description: 'Light freezing drizzle' },
  57: { icon: '🌧️', description: 'Dense freezing drizzle' },
  61: { icon: '🌧️', description: 'Slight rain' },
  63: { icon: '🌧️', description: 'Moderate rain' },
  65: { icon: '🌧️', description: 'Heavy rain' },
  66: { icon: '🌧️', description: 'Light freezing rain' },
  67: { icon: '🌧️', description: 'Heavy freezing rain' },
  71: { icon: '🌨️', description: 'Slight snow' },
  73: { icon: '🌨️', description: 'Moderate snow' },
  75: { icon: '❄️', description: 'Heavy snow' },
  77: { icon: '❄️', description: 'Snow grains' },
  80: { icon: '🌦️', description: 'Slight rain showers' },
  81: { icon: '🌧️', description: 'Moderate rain showers' },
  82: { icon: '🌧️', description: 'Violent rain showers' },
  85: { icon: '🌨️', description: 'Slight snow showers' },
  86: { icon: '❄️', description: 'Heavy snow showers' },
  95: { icon: '⛈️', description: 'Thunderstorm' },
  96: { icon: '⛈️', description: 'Thunderstorm with slight hail' },
  99: { icon: '⛈️', description: 'Thunderstorm with heavy hail' },
};

/**
 * Map WMO code to icon and description
 */
function getWeatherInfo(code: number): { icon: string; description: string } {
  return WMO_CODES[code] || { icon: '🌡️', description: 'Unknown' };
}

/**
 * Fetch weather data from Open-Meteo API
 * @param latitude - City latitude
 * @param longitude - City longitude
 * @param startDate - Trip start date (YYYY-MM-DD)
 * @param endDate - Trip end date (YYYY-MM-DD)
 * @returns Weather forecast for the date range
 */
export async function fetchWeather(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string
): Promise<WeatherForecast> {
  try {
    // Determine if we need historical or forecast data
    const today = new Date().toISOString().split('T')[0];
    const isHistorical = startDate < today;
    const isForecast = endDate > today;

    // Validate forecast range (Open-Meteo permite max 15 días hacia el futuro,
    // cuentan el día actual como día 0, así que day+15 es el último válido)
    const maxForecastDate = new Date();
    maxForecastDate.setDate(maxForecastDate.getDate() + 14); // 14 para tener margen de zona horaria
    const maxForecastDateStr = maxForecastDate.toISOString().split('T')[0];

    // If dates are too far in the future, throw a descriptive error
    if (startDate > maxForecastDateStr) {
      throw new Error(
        `Weather forecast is only available up to 14 days in the future (until ${maxForecastDateStr}). ` +
        `Your trip starts on ${startDate}.`
      );
    }

    // Adjust end date if it's beyond the forecast limit
    const adjustedEndDate = endDate > maxForecastDateStr ? maxForecastDateStr : endDate;

    // Open-Meteo API endpoint
    const baseUrl = isHistorical && !isForecast
      ? 'https://archive-api.open-meteo.com/v1/archive'
      : 'https://api.open-meteo.com/v1/forecast';

    // La API histórica no soporta precipitation_probability_max, usa precipitation_sum
    const useArchive = isHistorical && !isForecast;
    const precipField = useArchive
      ? 'precipitation_sum'
      : 'precipitation_probability_max';

    // Build query parameters
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      start_date: startDate,
      end_date: adjustedEndDate,
      daily: `temperature_2m_max,temperature_2m_min,${precipField},weather_code`,
      timezone: 'auto',
    });

    const fullUrl = `${baseUrl}?${params}`;
    console.log('Open-Meteo API request:', fullUrl);

    // Make API request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let response;
    try {
      response = await fetch(fullUrl, {
        signal: controller.signal,
        next: { revalidate: 3600 }, // Cache for 1 hour
      });
      clearTimeout(timeoutId);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Open-Meteo fetch error:', error);
      throw error;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Open-Meteo API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: fullUrl,
      });
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    const data = await response.json();

    // Parse response
    // La API histórica devuelve precipitation_sum (mm), la de pronóstico devuelve
    // precipitation_probability_max (%). Normalizamos ambos a un valor 0-100.
    const days: WeatherDay[] = data.daily.time.map((date: string, index: number) => {
      const weatherCode = data.daily.weather_code[index];
      const weatherInfo = getWeatherInfo(weatherCode);

      let precipitationProb = 0;
      if (useArchive) {
        // precipitation_sum en mm: convertimos a una probabilidad aproximada (≥1mm → 50%, ≥10mm → 100%)
        const sum = data.daily.precipitation_sum?.[index] ?? 0;
        precipitationProb = Math.min(100, Math.round(sum * 10));
      } else {
        precipitationProb = data.daily.precipitation_probability_max?.[index] ?? 0;
      }

      return {
        date,
        tempMax: Math.round(data.daily.temperature_2m_max[index]),
        tempMin: Math.round(data.daily.temperature_2m_min[index]),
        precipitationProb,
        weatherCode,
        weatherIcon: weatherInfo.icon,
        weatherDescription: weatherInfo.description,
      };
    });

    return {
      city: '', // Will be filled by the API route
      latitude,
      longitude,
      days,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

/**
 * Get weather description translation key
 * Maps WMO descriptions to translation keys
 */
export function getWeatherTranslationKey(description: string): string {
  const keyMap: Record<string, string> = {
    'Clear sky': 'weather.clearSky',
    'Mainly clear': 'weather.mainlyClear',
    'Partly cloudy': 'weather.partlyCloudy',
    'Overcast': 'weather.overcast',
    'Foggy': 'weather.foggy',
    'Depositing rime fog': 'weather.rimeFog',
    'Light drizzle': 'weather.lightDrizzle',
    'Moderate drizzle': 'weather.moderateDrizzle',
    'Dense drizzle': 'weather.denseDrizzle',
    'Light freezing drizzle': 'weather.lightFreezingDrizzle',
    'Dense freezing drizzle': 'weather.denseFreezingDrizzle',
    'Slight rain': 'weather.slightRain',
    'Moderate rain': 'weather.moderateRain',
    'Heavy rain': 'weather.heavyRain',
    'Light freezing rain': 'weather.lightFreezingRain',
    'Heavy freezing rain': 'weather.heavyFreezingRain',
    'Slight snow': 'weather.slightSnow',
    'Moderate snow': 'weather.moderateSnow',
    'Heavy snow': 'weather.heavySnow',
    'Snow grains': 'weather.snowGrains',
    'Slight rain showers': 'weather.slightRainShowers',
    'Moderate rain showers': 'weather.moderateRainShowers',
    'Violent rain showers': 'weather.violentRainShowers',
    'Slight snow showers': 'weather.slightSnowShowers',
    'Heavy snow showers': 'weather.heavySnowShowers',
    'Thunderstorm': 'weather.thunderstorm',
    'Thunderstorm with slight hail': 'weather.thunderstormSlightHail',
    'Thunderstorm with heavy hail': 'weather.thunderstormHeavyHail',
    'Unknown': 'weather.unknown',
  };

  return keyMap[description] || 'weather.unknown';
}
