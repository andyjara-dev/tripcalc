import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateDailyCostSchema = z.object({
  accommodation: z.number().positive().optional(),
  food: z.number().positive().optional(),
  transport: z.number().positive().optional(),
  activities: z.number().positive().optional(),
  breakfast: z.number().nullable().optional(),
  lunch: z.number().nullable().optional(),
  dinner: z.number().nullable().optional(),
  snacks: z.number().nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ cityId: string; costId: string }> }
) {
  try {
    const session = await auth();
    const { cityId, costId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // @ts-ignore
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateDailyCostSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error },
        { status: 400 }
      );
    }

    // Update daily cost
    const dailyCost = await prisma.cityDailyCost.update({
      where: { id: costId, cityId },
      data: validation.data,
    });

    return NextResponse.json({ dailyCost });
  } catch (error) {
    console.error('Error updating daily cost:', error);
    return NextResponse.json(
      { error: 'Failed to update daily cost' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ cityId: string; costId: string }> }
) {
  try {
    const session = await auth();
    const { cityId, costId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // @ts-ignore
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.cityDailyCost.delete({
      where: { id: costId, cityId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting daily cost:', error);
    return NextResponse.json(
      { error: 'Failed to delete daily cost' },
      { status: 500 }
    );
  }
}
