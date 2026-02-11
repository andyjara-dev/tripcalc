/**
 * Geocoding API Endpoint
 * POST /api/itinerary/geocode
 * Geocodes an address using Nominatim (OpenStreetMap)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { geocode, type CityBounds } from '@/lib/services/geocoding';
import { z } from 'zod';

// Request validation schema
const geocodeRequestSchema = z.object({
  address: z.string().min(3, 'Address must be at least 3 characters'),
  cityBounds: z.object({
    north: z.number(),
    south: z.number(),
    east: z.number(),
    west: z.number(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate request
    const validation = geocodeRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { address, cityBounds } = validation.data;

    // Geocode address
    try {
      const geoLocation = await geocode(address, session.user.id, cityBounds);

      return NextResponse.json({
        success: true,
        location: geoLocation,
      });
    } catch (error) {
      // Handle specific geocoding errors
      if (error instanceof Error) {
        if (error.message === 'RATE_LIMIT_EXCEEDED') {
          return NextResponse.json(
            {
              error: 'Rate limit exceeded',
              message: 'You have exceeded the maximum number of geocoding requests per hour (50). Please try again later.',
            },
            { status: 429 }
          );
        }

        if (error.message === 'ADDRESS_NOT_FOUND') {
          return NextResponse.json(
            {
              error: 'Address not found',
              message: 'Could not find the specified address. Please try a different address or be more specific.',
            },
            { status: 404 }
          );
        }

        if (error.message === 'GEOCODING_TIMEOUT') {
          return NextResponse.json(
            {
              error: 'Geocoding timeout',
              message: 'The geocoding service took too long to respond. Please try again.',
            },
            { status: 504 }
          );
        }

        if (error.message === 'GEOCODING_FAILED') {
          return NextResponse.json(
            {
              error: 'Geocoding failed',
              message: 'An error occurred while geocoding the address. Please try again.',
            },
            { status: 500 }
          );
        }

        // Generic error
        return NextResponse.json(
          {
            error: 'Geocoding error',
            message: error.message,
          },
          { status: 500 }
        );
      }

      // Unknown error
      return NextResponse.json(
        {
          error: 'Internal server error',
          message: 'An unexpected error occurred',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Geocoding API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
