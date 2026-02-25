import { NextRequest, NextResponse } from 'next/server';
import { searchNearby } from '@/lib/services/overpass';
import type { NearbyCategory } from '@/lib/types/nearby';
import { NEARBY_CATEGORIES } from '@/lib/types/nearby';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const latStr = searchParams.get('lat');
  const lonStr = searchParams.get('lon');
  const category = searchParams.get('category');
  const radiusStr = searchParams.get('radius') || '500';

  // Validar parámetros
  if (!latStr || !lonStr || !category) {
    return NextResponse.json(
      { error: 'Missing required parameters: lat, lon, category' },
      { status: 400 }
    );
  }

  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);
  const radius = parseInt(radiusStr, 10);

  if (isNaN(lat) || lat < -90 || lat > 90) {
    return NextResponse.json(
      { error: 'Invalid lat: must be a number between -90 and 90' },
      { status: 400 }
    );
  }

  if (isNaN(lon) || lon < -180 || lon > 180) {
    return NextResponse.json(
      { error: 'Invalid lon: must be a number between -180 and 180' },
      { status: 400 }
    );
  }

  if (!NEARBY_CATEGORIES.includes(category as NearbyCategory)) {
    return NextResponse.json(
      { error: `Invalid category. Must be one of: ${NEARBY_CATEGORIES.join(', ')}` },
      { status: 400 }
    );
  }

  if (isNaN(radius) || radius < 100 || radius > 2000) {
    return NextResponse.json(
      { error: 'Invalid radius: must be between 100 and 2000 meters' },
      { status: 400 }
    );
  }

  try {
    const places = await searchNearby(lat, lon, category as NearbyCategory, radius);

    return NextResponse.json(
      { places },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (error) {
    console.error('[nearby] Overpass API error:', error);
    return NextResponse.json(
      { error: 'Search service unavailable. Please try again.' },
      { status: 503 }
    );
  }
}
