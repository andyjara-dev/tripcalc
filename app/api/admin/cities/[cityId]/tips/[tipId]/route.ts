import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateTipSchema = z.object({
  category: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  order: z.number().int().min(0).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ cityId: string; tipId: string }> }
) {
  try {
    const session = await auth();
    const { cityId, tipId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // @ts-ignore
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validation = updateTipSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error },
        { status: 400 }
      );
    }

    // Update tip
    const tip = await prisma.cityTip.update({
      where: { id: tipId, cityId },
      data: validation.data,
    });

    return NextResponse.json({ tip });
  } catch (error) {
    console.error('Error updating tip:', error);
    return NextResponse.json(
      { error: 'Failed to update tip' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ cityId: string; tipId: string }> }
) {
  try {
    const session = await auth();
    const { cityId, tipId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // @ts-ignore
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.cityTip.delete({
      where: { id: tipId, cityId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tip:', error);
    return NextResponse.json(
      { error: 'Failed to delete tip' },
      { status: 500 }
    );
  }
}
