import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { nanoid } from 'nanoid';

// POST /api/trips/[id]/share - Toggle public sharing
export async function POST(
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

    // Verify trip ownership
    const trip = await prisma.trip.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { isPublic } = body;

    // Generate shareToken if making public and doesn't have one
    const shareToken = isPublic && !trip.shareToken
      ? nanoid(12)
      : trip.shareToken;

    // Update trip
    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: {
        isPublic,
        shareToken,
      },
    });

    return NextResponse.json({
      trip: updatedTrip,
      shareUrl: isPublic ? `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/shared/${shareToken}` : null
    });
  } catch (error) {
    console.error('Error updating share settings:', error);
    return NextResponse.json(
      { error: 'Failed to update share settings' },
      { status: 500 }
    );
  }
}
