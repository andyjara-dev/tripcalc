/**
 * Admin API: Single City Operations
 * GET    /api/admin/cities/[cityId] - Get city details
 * PATCH  /api/admin/cities/[cityId] - Update city
 * DELETE /api/admin/cities/[cityId] - Delete city
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { cityUpdateSchema } from '@/lib/validations/city';

type Params = {
  params: Promise<{
    cityId: string;
  }>;
};

/**
 * GET /api/admin/cities/[cityId]
 * Get complete city details with all relations
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();

    const { cityId } = await params;

    const city = await prisma.city.findUnique({
      where: { id: cityId },
      include: {
        dailyCosts: {
          orderBy: { travelStyle: 'asc' },
        },
        transport: {
          orderBy: [{ type: 'asc' }, { name: 'asc' }],
        },
        airports: true,
        tips: {
          orderBy: { order: 'asc' },
        },
        cashInfo: true,
      },
    });

    if (!city) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }

    return NextResponse.json({ city });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('Error fetching city:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/cities/[cityId]
 * Update city details
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();

    const { cityId } = await params;
    const body = await request.json();

    // Validate input
    const validation = cityUpdateSchema.safeParse({ ...body, id: cityId });
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

    // Check if city exists
    const existing = await prisma.city.findUnique({
      where: { id: cityId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }

    // Update city
    const city = await prisma.city.update({
      where: { id: cityId },
      data: {
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
        isPublished: data.isPublished,
        lastUpdated: data.lastUpdated,
      },
    });

    return NextResponse.json({ city });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('Error updating city:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/cities/[cityId]
 * Delete a city (cascades to all related data)
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();

    const { cityId } = await params;

    // Check if city exists
    const existing = await prisma.city.findUnique({
      where: { id: cityId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }

    // Delete city (cascades to all related data due to onDelete: Cascade)
    await prisma.city.delete({
      where: { id: cityId },
    });

    return NextResponse.json({ success: true, message: 'City deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error('Error deleting city:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
