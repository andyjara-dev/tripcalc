import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-helpers';

// GET /api/admin/users - List all users (admin only)
export async function GET() {
  try {
    // Verify admin access
    await requireAdmin();

    // Get all users with basic info
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isPremium: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: {
            trips: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get stats
    const totalUsers = users.length;
    const premiumUsers = users.filter(u => u.isPremium).length;
    const adminUsers = users.filter(u => u.isAdmin).length;

    return NextResponse.json({
      users,
      stats: {
        total: totalUsers,
        premium: premiumUsers,
        admins: adminUsers,
      },
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);

    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
