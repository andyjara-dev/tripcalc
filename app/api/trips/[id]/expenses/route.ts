import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { expenseSchema } from '@/lib/validations/expense';
import { z } from 'zod';

// GET /api/trips/[id]/expenses - List expenses for a trip
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify trip ownership
    const trip = await prisma.trip.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    // Get all expenses for this trip
    const expenses = await prisma.expense.findMany({
      where: {
        tripId: id,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

// POST /api/trips/[id]/expenses - Create new expense
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify trip ownership
    const trip = await prisma.trip.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = expenseSchema.parse(body);

    // Create expense
    const expense = await prisma.expense.create({
      data: {
        tripId: id,
        name: validated.name,
        category: validated.category,
        amount: validated.amount,
        currency: validated.currency,
        date: validated.date ? new Date(validated.date) : new Date(),
        notes: validated.notes || null,
      },
    });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}
