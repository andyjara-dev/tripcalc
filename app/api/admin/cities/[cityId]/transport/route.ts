import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const transportSchema = z.object({
  type: z.string().min(1),
  name: z.string().min(1),
  price: z.number().positive(),
  priceNote: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  tips: z.string().nullable().optional(),
  bookingUrl: z.string().url().nullable().optional(),
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
    const validation = transportSchema.safeParse(body);

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

    // Create transport option
    const transport = await prisma.cityTransport.create({
      data: {
        cityId,
        ...validation.data,
      },
    });

    return NextResponse.json({ transport });
  } catch (error) {
    console.error('Error creating transport option:', error);
    return NextResponse.json(
      { error: 'Failed to create transport option' },
      { status: 500 }
    );
  }
}
