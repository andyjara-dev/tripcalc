import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const luggageRules = await prisma.airlineLuggage.findMany({
      where: {
        airlineId: id,
      },
      select: {
        id: true,
        type: true,
        dimensions: true,
        weightKg: true,
        notes: true,
      },
      orderBy: [
        { type: 'asc' },
      ],
    });

    if (luggageRules.length === 0) {
      return NextResponse.json(
        { error: 'Airline not found or has no luggage rules' },
        { status: 404 }
      );
    }

    return NextResponse.json({ luggageRules });
  } catch (error) {
    console.error('Error fetching luggage rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch luggage rules' },
      { status: 500 }
    );
  }
}
