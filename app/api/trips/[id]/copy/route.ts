import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/trips/[id]/copy - Copy a shared trip to own trips
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check access: user owns it OR has a SharedTrip record
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        customItems: true,
      },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const isOwner = trip.userId === session.user.id;

    if (!isOwner) {
      const sharedRecord = await prisma.sharedTrip.findUnique({
        where: {
          tripId_sharedWithId: {
            tripId: id,
            sharedWithId: session.user.id,
          },
        },
      });

      if (!sharedRecord) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Create copy of the trip
    const newTrip = await prisma.trip.create({
      data: {
        userId: session.user.id,
        cityId: trip.cityId,
        cityName: trip.cityName,
        name: `${trip.name} (copy)`,
        startDate: trip.startDate,
        endDate: trip.endDate,
        days: trip.days,
        tripStyle: trip.tripStyle,
        calculatorState: trip.calculatorState as object,
        budgetAccommodation: trip.budgetAccommodation,
        budgetFood: trip.budgetFood,
        budgetTransport: trip.budgetTransport,
        budgetActivities: trip.budgetActivities,
        isPublic: false,
        shareToken: null,
      },
    });

    // Copy custom items if any
    if (trip.customItems.length > 0) {
      await prisma.customItem.createMany({
        data: trip.customItems.map((item) => ({
          tripId: newTrip.id,
          name: item.name,
          category: item.category,
          amount: item.amount,
          currency: item.currency,
          notes: item.notes,
          normalizedName: item.normalizedName,
          cityId: item.cityId,
          userLocale: item.userLocale,
        })),
      });
    }

    return NextResponse.json({ trip: newTrip });
  } catch (error) {
    console.error('Error copying trip:', error);
    return NextResponse.json(
      { error: 'Failed to copy trip' },
      { status: 500 }
    );
  }
}
