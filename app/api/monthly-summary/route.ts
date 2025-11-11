/**
 * API Route: Monthly Summary
 * 
 * Returns total expenses for a given month and the user's budget for that month.
 * Query: ?month=YYYY-MM
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Expense from '@/models/Expense';
import Budget from '@/models/Budget';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const month = url.searchParams.get('month') || '';
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        { success: false, error: 'Invalid month parameter' },
        { status: 400 }
      );
    }

    const token = cookies().get(SESSION_COOKIE)?.value;
    const session = token ? await verifySession(token) : null;
    if (!session) {
      return NextResponse.json({ success: true, data: { month, totalExpenses: 0, budgetAmount: 0 } });
    }

    await connectDB();

    // Compute month boundaries
    const [y, m] = month.split('-').map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);

    // Sum expenses in this month
    const expenses = await Expense.find({
      date: { $gte: start, $lt: end },
    }).lean();

    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    // Get budget
    const budget = await Budget.findOne({ userId: session.userId, month }).lean();
    const budgetAmount = budget?.amount || 0;

    return NextResponse.json({
      success: true,
      data: { month, totalExpenses, budgetAmount },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch monthly summary' },
      { status: 500 }
    );
  }
}


