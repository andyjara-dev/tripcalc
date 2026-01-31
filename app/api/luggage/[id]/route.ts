import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const packingList = await prisma.packingList.findUnique({
      where: { id },
    });

    if (!packingList) {
      return NextResponse.json({ error: 'Packing list not found' }, { status: 404 });
    }

    // Verify ownership
    if (packingList.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ packingList });
  } catch (error) {
    console.error('Error fetching packing list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packing list' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const packingList = await prisma.packingList.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!packingList) {
      return NextResponse.json({ error: 'Packing list not found' }, { status: 404 });
    }

    // Verify ownership
    if (packingList.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await prisma.packingList.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting packing list:', error);
    return NextResponse.json(
      { error: 'Failed to delete packing list' },
      { status: 500 }
    );
  }
}
