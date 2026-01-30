/**
 * Admin API: List and Create Cities
 * GET  /api/admin/cities - List all cities (published + drafts)
 * POST /api/admin/cities - Create new city
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { citySchema } from '@/lib/validations/city';

/**
 * GET /api/admin/cities
 * List all cities with stats
 */
export async function GET() {
  try {
    await requireAdmin();

    const cities = await prisma.city.findMany({
      include: {
        _count: {
          select: {
            dailyCosts: true,
            transport: true,
            tips: true,
            airports: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ cities });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('Error fetching cities:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/cities
 * Create a new city
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    // Validate input
    const validation = citySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if city ID already exists
    const existing = await prisma.city.findUnique({
      where: { id: data.id },
    });

    if (existing) {
      return NextResponse.json({ error: 'City ID already exists' }, { status: 409 });
    }

    // Create city
    const city = await prisma.city.create({
      data: {
        id: data.id,
        name: data.name,
        country: data.country,
        region: data.region,
        currency: data.currency,
        currencySymbol: data.currencySymbol,
        language: data.language,
        timezone: data.timezone,
        population: data.population,
        touristSeason: data.touristSeason,
        description: data.description,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        imageUrl: data.imageUrl,
        imageCredit: data.imageCredit,
        isPublished: data.isPublished ?? false,
        lastUpdated: data.lastUpdated,
      },
    });

    return NextResponse.json({ city }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('Error creating city:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
