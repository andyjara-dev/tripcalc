import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-helpers';

interface RouteParams {
  params: Promise<{
    userId: string;
  }>;
}

// PATCH /api/admin/users/[userId] - Update user (toggle premium, admin, etc.)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify admin access
    await requireAdmin();

    const { userId } = await params;
    const body = await request.json();
    const { isPremium, isAdmin } = body;

    // Validate input
    if (typeof isPremium !== 'boolean' && typeof isAdmin !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: { isPremium?: boolean; isAdmin?: boolean } = {};
    if (typeof isPremium === 'boolean') {
      updateData.isPremium = isPremium;
    }
    if (typeof isAdmin === 'boolean') {
      updateData.isAdmin = isAdmin;
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        isPremium: true,
        isAdmin: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Error updating user:', error);

    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
