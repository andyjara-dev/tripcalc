/**
 * API Route: Reverse Geocode
 * Converts coordinates to address
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { reverseGeocode } from '@/lib/services/geocoding';
import { z } from 'zod';

// Request validation schema
const ReverseGeocodeRequestSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = ReverseGeocodeRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid coordinates',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { lat, lon } = validation.data;

    // Call reverse geocoding service
    const location = await reverseGeocode(lat, lon, session.user.id);

    return NextResponse.json({
      success: true,
      location,
    });

  } catch (error) {
    console.error('Reverse geocoding API error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === 'RATE_LIMIT_EXCEEDED') {
        return NextResponse.json(
          {
            success: false,
            error: 'Rate limit exceeded. Please try again later.',
          },
          { status: 429 }
        );
      }

      if (error.message === 'ADDRESS_NOT_FOUND') {
        return NextResponse.json(
          {
            success: false,
            error: 'Could not find address for these coordinates',
          },
          { status: 404 }
        );
      }

      if (error.message === 'GEOCODING_TIMEOUT') {
        return NextResponse.json(
          {
            success: false,
            error: 'Request timed out. Please try again.',
          },
          { status: 504 }
        );
      }
    }

    // Generic error
    return NextResponse.json(
      {
        success: false,
        error: 'Reverse geocoding failed. Please try again.',
      },
      { status: 500 }
    );
  }
}
