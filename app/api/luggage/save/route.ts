import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const savePackingListSchema = z.object({
  tripId: z.string().optional(),
  listId: z.string().optional(), // ID of existing list to update
  preset: z.string().optional(), // Luggage preset selected
  luggageType: z.string(),
  weightLimit: z.number(),
  dimensions: z.string().optional(),
  duration: z.number(),
  tripType: z.string(),
  climate: z.string().optional(), // Optional in advanced mode
  gender: z.string(),
  activities: z.string().optional(),
  // Advanced mode fields
  destination: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  // Packing list data
  items: z.any(), // JSON
  totalWeight: z.number(),
  tips: z.any(), // JSON
  warnings: z.any().optional(), // JSON
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = savePackingListSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error },
        { status: 400 }
      );
    }

    const { tripId, listId, ...data } = validation.data;

    // Verify trip belongs to user if tripId provided
    if (tripId) {
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        select: { userId: true },
      });

      if (!trip || trip.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Trip not found or access denied' },
          { status: 404 }
        );
      }
    }

    let packingList;

    // If listId is provided, update existing list
    if (listId) {
      // Verify list belongs to user
      const existingList = await prisma.packingList.findUnique({
        where: { id: listId },
        select: { userId: true },
      });

      if (!existingList || existingList.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Packing list not found or access denied' },
          { status: 404 }
        );
      }

      // Update existing packing list
      packingList = await prisma.packingList.update({
        where: { id: listId },
        data: {
          tripId: tripId || null,
          ...data,
        },
      });
    } else {
      // Create new packing list
      packingList = await prisma.packingList.create({
        data: {
          userId: session.user.id,
          tripId: tripId || null,
          ...data,
        },
      });
    }

    return NextResponse.json({ packingList });
  } catch (error) {
    console.error('Error saving packing list:', error);
    return NextResponse.json(
      { error: 'Failed to save packing list' },
      { status: 500 }
    );
  }
}
