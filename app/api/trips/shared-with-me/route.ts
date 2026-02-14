import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/trips/shared-with-me - List trips shared with the current user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sharedTrips = await prisma.sharedTrip.findMany({
      where: { sharedWithId: session.user.id },
      include: {
        trip: {
          select: {
            id: true,
            name: true,
            cityId: true,
            cityName: true,
            startDate: true,
            endDate: true,
            days: true,
            tripStyle: true,
            calculatorState: true,
            shareToken: true,
            isPublic: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        sharedBy: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ sharedTrips });
  } catch (error) {
    console.error('Error fetching shared trips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared trips' },
      { status: 500 }
    );
  }
}
