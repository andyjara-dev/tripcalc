import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/shared/[shareToken] - Get public trip
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params;

    // Find public trip by shareToken
    const trip = await prisma.trip.findFirst({
      where: {
        shareToken,
        isPublic: true, // Only return if public
      },
      include: {
        customItems: true,
        expenses: {
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found or not public' },
        { status: 404 }
      );
    }

    // Increment view count (optional)
    // await prisma.trip.update({
    //   where: { id: trip.id },
    //   data: { viewCount: { increment: 1 } },
    // });

    return NextResponse.json({ trip });
  } catch (error) {
    console.error('Error fetching shared trip:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared trip' },
      { status: 500 }
    );
  }
}
