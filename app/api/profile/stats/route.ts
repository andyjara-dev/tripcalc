import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await requireAuth();

    const stats = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        _count: {
          select: {
            trips: true,
          },
        },
        trips: {
          select: {
            shareToken: true,
            _count: {
              select: {
                expenses: true,
              },
            },
          },
        },
      },
    });

    const totalTrips = stats?._count.trips || 0;
    const sharedTrips = stats?.trips.filter(t => t.shareToken).length || 0;
    const totalExpenses = stats?.trips.reduce((sum, t) => sum + t._count.expenses, 0) || 0;

    return NextResponse.json({
      totalTrips,
      sharedTrips,
      totalExpenses,
    });
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
