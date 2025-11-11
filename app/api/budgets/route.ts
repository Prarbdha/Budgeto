/**
 * API Route: Get Budgets for current user
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Budget from '@/models/Budget';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';

export async function GET() {
  try {
    const token = cookies().get(SESSION_COOKIE)?.value;
    const session = token ? await verifySession(token) : null;
    if (!session) {
      return NextResponse.json({ success: true, data: [] });
    }

    await connectDB();
    const budgets = await Budget.find({ userId: session.userId })
      .sort({ month: -1 })
      .lean();

    return NextResponse.json({ success: true, data: budgets });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}


