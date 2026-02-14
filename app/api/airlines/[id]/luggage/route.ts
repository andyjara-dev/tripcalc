import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAirlineLuggage } from '@/data/airlines';

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

    // Fallback to static data if no rules found in DB
    if (luggageRules.length === 0) {
      const staticRules = getAirlineLuggage(id);
      if (staticRules.length > 0) {
        return NextResponse.json({ luggageRules: staticRules });
      }
      return NextResponse.json(
        { error: 'Airline not found or has no luggage rules' },
        { status: 404 }
      );
    }

    return NextResponse.json({ luggageRules });
  } catch (error) {
    console.error('Error fetching luggage rules:', error);
    // Fallback to static data on error
    const staticRules = getAirlineLuggage((await context.params).id);
    if (staticRules.length > 0) {
      return NextResponse.json({ luggageRules: staticRules });
    }
    return NextResponse.json(
      { error: 'Failed to fetch luggage rules' },
      { status: 500 }
    );
  }
}
