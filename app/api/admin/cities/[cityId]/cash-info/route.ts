import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const cashInfoSchema = z.object({
  cashNeeded: z.enum(['low', 'medium', 'high']),
  cardsAccepted: z.enum(['widely', 'most-places', 'limited']),
  atmAvailability: z.enum(['everywhere', 'common', 'limited']),
  recommendations: z.string().min(1),
  atmFees: z.string().nullable().optional(),
  bestExchange: z.string().nullable().optional(),
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
    const validation = cashInfoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: validation.error },
        { status: 400 }
      );
    }

    // Check if city exists
    const city = await prisma.city.findUnique({
      where: { id: cityId },
      include: { cashInfo: true },
    });

    if (!city) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }

    // Check if cash info already exists
    if (city.cashInfo) {
      return NextResponse.json(
        { error: 'Cash info already exists for this city. Use PATCH to update.' },
        { status: 400 }
      );
    }

    // Create cash info
    const cashInfo = await prisma.cityCashInfo.create({
      data: {
        cityId,
        ...validation.data,
      },
    });

    return NextResponse.json({ cashInfo });
  } catch (error) {
    console.error('Error creating cash info:', error);
    return NextResponse.json(
      { error: 'Failed to create cash info' },
      { status: 500 }
    );
  }
}
