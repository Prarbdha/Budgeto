/**
 * Server Action: Add or Update Monthly Budget
 */

'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Budget from '@/models/Budget';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';

export async function upsertBudgetAction(formData: {
  month: string; // YYYY-MM
  amount: number;
}) {
  try {
    const token = cookies().get(SESSION_COOKIE)?.value;
    const session = token ? await verifySession(token) : null;
    if (!session) {
      return { success: false, error: 'Unauthorized' };
    }

    const month = String(formData.month).trim();
    const amount = Number(formData.amount);

    if (!/^\d{4}-\d{2}$/.test(month) || isNaN(amount)) {
      return { success: false, error: 'Invalid month or amount' };
    }

    await connectDB();

    await Budget.findOneAndUpdate(
      { userId: session.userId, month },
      { $set: { amount } },
      { upsert: true, new: true }
    );

    revalidatePath('/budgets');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to save budget' };
  }
}


