import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateTransportSchema = z.object({
  type: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  priceNote: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  tips: z.string().nullable().optional(),
  bookingUrl: z.string().url().nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ cityId: string; transportId: string }> }
) {
  try {
    const session = await auth();
    const { cityId, transportId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // @ts-ignore
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateTransportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error },
        { status: 400 }
      );
    }

    // Update transport option
    const transport = await prisma.cityTransport.update({
      where: { id: transportId, cityId },
      data: validation.data,
    });

    return NextResponse.json({ transport });
  } catch (error) {
    console.error('Error updating transport option:', error);
    return NextResponse.json(
      { error: 'Failed to update transport option' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ cityId: string; transportId: string }> }
) {
  try {
    const session = await auth();
    const { cityId, transportId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // @ts-ignore
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.cityTransport.delete({
      where: { id: transportId, cityId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transport option:', error);
    return NextResponse.json(
      { error: 'Failed to delete transport option' },
      { status: 500 }
    );
  }
}
