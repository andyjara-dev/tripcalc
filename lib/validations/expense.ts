import { z } from 'zod';

export const expenseSchema = z.object({
  name: z.string()
    .min(1, 'Expense name is required')
    .max(100, 'Name too long'),
  category: z.enum(['ACCOMMODATION', 'FOOD', 'TRANSPORT', 'ACTIVITIES', 'SHOPPING', 'OTHER']),
  amount: z.number()
    .int('Must be whole cents')
    .positive('Amount must be positive')
    .max(10000000, 'Amount too high'), // Max $100k
  currency: z.string().length(3, 'Invalid currency code'),
  date: z.string().optional(), // ISO date string
  notes: z.string().max(500, 'Notes too long').optional(),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;

// Client-side type for display
export interface ExpenseDisplay {
  id: string;
  tripId: string;
  name: string;
  category: 'ACCOMMODATION' | 'FOOD' | 'TRANSPORT' | 'ACTIVITIES' | 'SHOPPING' | 'OTHER';
  amount: number; // In cents
  currency: string;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
