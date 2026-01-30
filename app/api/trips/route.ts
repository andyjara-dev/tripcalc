import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema
const createTripSchema = z.object({
  name: z.string().min(1, 'Trip name is required').max(100),
  cityId: z.string().min(1, 'City ID is required'),
  cityName: z.string().min(1, 'City name is required'),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  days: z.number().int().min(1).max(30),
  tripStyle: z.enum(['BUDGET', 'MID_RANGE', 'LUXURY']),
  calculatorState: z.any(), // DayPlan[] as JSON
});

// GET /api/trips - List user's trips
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const trips = await prisma.trip.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        cityId: true,
        cityName: true,
        startDate: true,
        endDate: true,
        days: true,
        tripStyle: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            customItems: true,
          },
        },
      },
    });

    return NextResponse.json({ trips });
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trips' },
      { status: 500 }
    );
  }
}

// POST /api/trips - Create new trip
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = createTripSchema.parse(body);

    // Create trip
    const trip = await prisma.trip.create({
      data: {
        userId: session.user.id,
        name: validated.name,
        cityId: validated.cityId,
        cityName: validated.cityName,
        startDate: validated.startDate ? new Date(validated.startDate) : null,
        endDate: validated.endDate ? new Date(validated.endDate) : null,
        days: validated.days,
        tripStyle: validated.tripStyle,
        calculatorState: validated.calculatorState,
      },
    });

    // Extract and save custom items with normalization
    const calculatorState = validated.calculatorState as any[];
    const customItemsToCreate: any[] = [];

    calculatorState.forEach((day: any) => {
      if (day.customItems && Array.isArray(day.customItems)) {
        day.customItems.forEach((item: any) => {
          customItemsToCreate.push({
            tripId: trip.id,
            name: item.name,
            category: item.category,
            amount: item.amount,
            currency: 'USD', // TODO: Get from city data
            notes: item.notes || null,
            // Normalization for analytics
            normalizedName: item.name.toLowerCase().trim().replace(/\s+/g, ' '),
            cityId: validated.cityId,
            userLocale: request.headers.get('accept-language')?.split(',')[0].split('-')[0] || 'en',
          });
        });
      }
    });

    // Bulk create custom items
    if (customItemsToCreate.length > 0) {
      await prisma.customItem.createMany({
        data: customItemsToCreate,
      });
    }

    return NextResponse.json({ trip }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating trip:', error);
    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    );
  }
}
