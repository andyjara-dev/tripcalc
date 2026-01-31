import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateCashInfoSchema = z.object({
  cashNeeded: z.enum(['low', 'medium', 'high']).optional(),
  cardsAccepted: z.enum(['widely', 'most-places', 'limited']).optional(),
  atmAvailability: z.enum(['everywhere', 'common', 'limited']).optional(),
  recommendations: z.string().min(1).optional(),
  atmFees: z.string().nullable().optional(),
  bestExchange: z.string().nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ cityId: string; cashInfoId: string }> }
) {
  try {
    const session = await auth();
    const { cityId, cashInfoId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // @ts-ignore
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateCashInfoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error },
        { status: 400 }
      );
    }

    // Update cash info
    const cashInfo = await prisma.cityCashInfo.update({
      where: { id: cashInfoId, cityId },
      data: validation.data,
    });

    return NextResponse.json({ cashInfo });
  } catch (error) {
    console.error('Error updating cash info:', error);
    return NextResponse.json(
      { error: 'Failed to update cash info' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ cityId: string; cashInfoId: string }> }
) {
  try {
    const session = await auth();
    const { cityId, cashInfoId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // @ts-ignore
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.cityCashInfo.delete({
      where: { id: cashInfoId, cityId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cash info:', error);
    return NextResponse.json(
      { error: 'Failed to delete cash info' },
      { status: 500 }
    );
  }
}
