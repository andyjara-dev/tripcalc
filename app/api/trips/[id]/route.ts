import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// Validation schema for update
const updateTripSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  days: z.number().int().min(1).max(30).optional(),
  tripStyle: z.enum(['BUDGET', 'MID_RANGE', 'LUXURY']).optional(),
  calculatorState: z.any().optional(),
  // Custom budget overrides (in cents, null = use city defaults)
  budgetAccommodation: z.number().int().min(0).max(1000000).nullable().optional(),
  budgetFood: z.number().int().min(0).max(1000000).nullable().optional(),
  budgetTransport: z.number().int().min(0).max(1000000).nullable().optional(),
  budgetActivities: z.number().int().min(0).max(1000000).nullable().optional(),
});

// GET /api/trips/[id] - Get specific trip
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const trip = await prisma.trip.findUnique({
      where: {
        id,
        userId: session.user.id, // Ensure user owns this trip
      },
      include: {
        customItems: true,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ trip });
  } catch (error) {
    console.error('Error fetching trip:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trip' },
      { status: 500 }
    );
  }
}

// PUT /api/trips/[id] - Update trip
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const existingTrip = await prisma.trip.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingTrip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = updateTripSchema.parse(body);

    // Update trip
    const trip = await prisma.trip.update({
      where: {
        id,
      },
      data: {
        name: validated.name,
        startDate: validated.startDate ? new Date(validated.startDate) : undefined,
        endDate: validated.endDate ? new Date(validated.endDate) : undefined,
        days: validated.days,
        tripStyle: validated.tripStyle,
        calculatorState: validated.calculatorState,
        // Custom budgets (undefined = don't update, null = reset to default)
        budgetAccommodation: validated.budgetAccommodation !== undefined ? validated.budgetAccommodation : undefined,
        budgetFood: validated.budgetFood !== undefined ? validated.budgetFood : undefined,
        budgetTransport: validated.budgetTransport !== undefined ? validated.budgetTransport : undefined,
        budgetActivities: validated.budgetActivities !== undefined ? validated.budgetActivities : undefined,
      },
    });

    // If calculatorState was updated, sync custom items
    if (validated.calculatorState) {
      // Delete existing custom items
      await prisma.customItem.deleteMany({
        where: {
          tripId: id,
        },
      });

      // Re-create from calculatorState
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
              normalizedName: item.name.toLowerCase().trim().replace(/\s+/g, ' '),
              cityId: existingTrip.cityId,
              userLocale: request.headers.get('accept-language')?.split(',')[0].split('-')[0] || 'en',
            });
          });
        }
      });

      if (customItemsToCreate.length > 0) {
        await prisma.customItem.createMany({
          data: customItemsToCreate,
        });
      }
    }

    return NextResponse.json({ trip });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating trip:', error);
    return NextResponse.json(
      { error: 'Failed to update trip' },
      { status: 500 }
    );
  }
}

// DELETE /api/trips/[id] - Delete trip
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership and delete
    const trip = await prisma.trip.deleteMany({
      where: {
        id,
        userId: session.user.id, // Ensure user owns this trip
      },
    });

    if (trip.count === 0) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting trip:', error);
    return NextResponse.json(
      { error: 'Failed to delete trip' },
      { status: 500 }
    );
  }
}
