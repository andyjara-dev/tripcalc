import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { expenseSchema } from '@/lib/validations/expense';
import { z } from 'zod';

// PUT /api/trips/[id]/expenses/[expenseId] - Update expense
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  try {
    const { id, expenseId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify trip ownership and expense belongs to trip
    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        tripId: id,
        trip: {
          userId: session.user.id,
        },
      },
    });

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = expenseSchema.parse(body);

    // Update expense
    const updatedExpense = await prisma.expense.update({
      where: {
        id: expenseId,
      },
      data: {
        name: validated.name,
        category: validated.category,
        amount: validated.amount,
        currency: validated.currency,
        date: validated.date ? new Date(validated.date) : expense.date,
        notes: validated.notes || null,
      },
    });

    return NextResponse.json({ expense: updatedExpense });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

// DELETE /api/trips/[id]/expenses/[expenseId] - Delete expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  try {
    const { id, expenseId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify trip ownership and expense belongs to trip
    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        tripId: id,
        trip: {
          userId: session.user.id,
        },
      },
    });

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    // Delete expense
    await prisma.expense.delete({
      where: {
        id: expenseId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
