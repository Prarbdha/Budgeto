/**
 * API Route: Get Expenses
 * 
 * Fetches all expenses from the database
 * Used by client components to display expense data
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Expense from '@/models/Expense';

/**
 * GET handler - Fetches all expenses
 * @returns JSON response with expenses array
 */
export async function GET() {
  try {
    // Connect to database
    await connectDB();

    // Fetch all expenses, sorted by date (newest first)
    const expenses = await Expense.find({})
      .sort({ date: -1 })
      .limit(100) // Limit to last 100 expenses
      .lean(); // Convert to plain JavaScript objects

    return NextResponse.json({
      success: true,
      data: expenses,
    });
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch expenses',
      },
      { status: 500 }
    );
  }
}

