import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const dailyCostSchema = z.object({
  travelStyle: z.enum(['budget', 'midRange', 'luxury']),
  accommodation: z.number().positive(),
  food: z.number().positive(),
  transport: z.number().positive(),
  activities: z.number().positive(),
  breakfast: z.number().nullable().optional(),
  lunch: z.number().nullable().optional(),
  dinner: z.number().nullable().optional(),
  snacks: z.number().nullable().optional(),
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
    const validation = dailyCostSchema.safeParse(body);

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

    // Check if this travel style already exists
    const existing = await prisma.cityDailyCost.findFirst({
      where: {
        cityId,
        travelStyle: validation.data.travelStyle,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'This travel style already exists for this city' },
        { status: 400 }
      );
    }

    // Create daily cost
    const dailyCost = await prisma.cityDailyCost.create({
      data: {
        cityId,
        ...validation.data,
      },
    });

    return NextResponse.json({ dailyCost });
  } catch (error) {
    console.error('Error creating daily cost:', error);
    return NextResponse.json(
      { error: 'Failed to create daily cost' },
      { status: 500 }
    );
  }
}
