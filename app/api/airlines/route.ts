import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAllAirlines } from '@/data/airlines';

export async function GET() {
  try {
    const airlines = await prisma.airline.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        code: true,
        country: true,
        region: true,
      },
    });

    // Fallback to static data if database is empty
    if (airlines.length === 0) {
      return NextResponse.json({ airlines: getAllAirlines() });
    }

    return NextResponse.json({ airlines });
  } catch (error) {
    console.error('Error fetching airlines:', error);
    // Fallback to static data on error
    return NextResponse.json({ airlines: getAllAirlines() });
  }
}
