import { NextRequest, NextResponse } from 'next/server';
import { getCityById } from '@/data/cities';
import { fetchWeather } from '@/lib/weather/open-meteo';

/**
 * GET /api/weather
 * Fetch weather data for a city and date range
 *
 * Query params:
 * - cityId: City identifier (e.g., 'barcelona')
 * - startDate: Trip start date (YYYY-MM-DD)
 * - endDate: Trip end date (YYYY-MM-DD)
 *
 * Returns:
 * - 200: Weather forecast data
 * - 400: Missing or invalid parameters
 * - 404: City not found or missing coordinates
 * - 500: API error
 */
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const cityId = searchParams.get('cityId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Validate parameters
    if (!cityId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: cityId, startDate, endDate' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Get city data
    const city = getCityById(cityId);
    if (!city) {
      return NextResponse.json(
        { error: `City not found: ${cityId}` },
        { status: 404 }
      );
    }

    // Check if city has coordinates
    if (!city.latitude || !city.longitude) {
      return NextResponse.json(
        { error: `City ${cityId} is missing latitude/longitude coordinates` },
        { status: 404 }
      );
    }

    // Log params for debugging
    console.log('Weather API request:', {
      cityId,
      cityName: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
      startDate,
      endDate,
    });

    // Fetch weather data
    const weatherData = await fetchWeather(
      city.latitude,
      city.longitude,
      startDate,
      endDate
    );

    // Add city name to response
    weatherData.city = city.name;

    // Return with cache headers
    return NextResponse.json(weatherData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Weather API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch weather data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
