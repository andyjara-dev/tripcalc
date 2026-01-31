import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const tipSchema = z.object({
  category: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  order: z.number().int().min(0).default(0),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ cityId: string }> }
) {
  try {
    const session = await auth();
    const { cityId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // @ts-ignore
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validation = tipSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error },
        { status: 400 }
      );
    }

    // Check if city exists
    const city = await prisma.city.findUnique({
      where: { id: cityId },
    });

    if (!city) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }

    // Create tip
    const tip = await prisma.cityTip.create({
      data: {
        cityId,
        ...validation.data,
      },
    });

    return NextResponse.json({ tip });
  } catch (error) {
    console.error('Error creating tip:', error);
    return NextResponse.json(
      { error: 'Failed to create tip' },
      { status: 500 }
    );
  }
}
