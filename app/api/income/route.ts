/**
 * API Route: Get Income
 * 
 * Fetches all income entries from the database
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Income from '@/models/Income';

/**
 * GET handler - Fetches all income entries
 * @returns JSON response with income array
 */
export async function GET() {
  try {
    // Connect to database
    await connectDB();

    // Fetch all income entries, sorted by date (newest first)
    const income = await Income.find({})
      .sort({ date: -1 })
      .limit(100) // Limit to last 100 entries
      .lean(); // Convert to plain JavaScript objects

    return NextResponse.json({
      success: true,
      data: income,
    });
  } catch (error: any) {
    console.error('Error fetching income:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch income',
      },
      { status: 500 }
    );
  }
}

