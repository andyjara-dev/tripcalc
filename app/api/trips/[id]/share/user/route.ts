import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const shareSchema = z.object({
  email: z.string().email(),
  message: z.string().optional(),
});

// POST /api/trips/[id]/share/user - Share trip with a registered user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = shareSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email, message } = parsed.data;

    // Verify trip ownership
    const trip = await prisma.trip.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Find target user by email
    const targetUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'userNotFound' },
        { status: 404 }
      );
    }

    // Cannot share with yourself
    if (targetUser.id === session.user.id) {
      return NextResponse.json(
        { error: 'cannotShareWithSelf' },
        { status: 400 }
      );
    }

    // Check if already shared
    const existing = await prisma.sharedTrip.findUnique({
      where: {
        tripId_sharedWithId: {
          tripId: id,
          sharedWithId: targetUser.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'alreadyShared' },
        { status: 409 }
      );
    }

    // Create shared trip record
    const sharedTrip = await prisma.sharedTrip.create({
      data: {
        tripId: id,
        sharedById: session.user.id,
        sharedWithId: targetUser.id,
        message,
      },
    });

    return NextResponse.json({
      success: true,
      sharedTrip,
      userName: targetUser.name || targetUser.email,
    });
  } catch (error) {
    console.error('Error sharing trip with user:', error);
    return NextResponse.json(
      { error: 'Failed to share trip' },
      { status: 500 }
    );
  }
}

// DELETE /api/trips/[id]/share/user - Revoke shared access
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sharedWithId } = await request.json();

    if (!sharedWithId) {
      return NextResponse.json(
        { error: 'sharedWithId is required' },
        { status: 400 }
      );
    }

    // Verify trip ownership
    const trip = await prisma.trip.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    await prisma.sharedTrip.delete({
      where: {
        tripId_sharedWithId: {
          tripId: id,
          sharedWithId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error revoking shared access:', error);
    return NextResponse.json(
      { error: 'Failed to revoke access' },
      { status: 500 }
    );
  }
}

// GET /api/trips/[id]/share/user - List users this trip is shared with
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify trip ownership
    const trip = await prisma.trip.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const sharedWith = await prisma.sharedTrip.findMany({
      where: { tripId: id },
      include: {
        sharedWith: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ sharedWith });
  } catch (error) {
    console.error('Error fetching shared users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared users' },
      { status: 500 }
    );
  }
}
