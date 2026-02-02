import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

    return NextResponse.json({ airlines });
  } catch (error) {
    console.error('Error fetching airlines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch airlines' },
      { status: 500 }
    );
  }
}
