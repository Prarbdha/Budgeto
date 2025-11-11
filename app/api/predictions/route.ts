/**
 * API Route: Get Expense Predictions
 * 
 * Calculates future expense trends based on the last 5 expense entries
 * Uses simple linear regression or average calculation
 */

import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Expense from '@/models/Expense';

/**
 * GET handler - Calculates expense predictions
 * @returns JSON response with prediction data
 */
export async function GET() {
  try {
    // Connect to database
    await connectDB();

    // Fetch last 5 expenses, sorted by date
    const expenses = await Expense.find({})
      .sort({ date: -1 })
      .limit(5)
      .lean();

    if (expenses.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          averageExpense: 0,
          predictedNextExpense: 0,
          trend: 'stable',
          message: 'Not enough data for predictions',
        },
      });
    }

    // Calculate average expense
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const averageExpense = totalAmount / expenses.length;

    // Simple trend analysis
    // Compare first half vs second half of expenses
    const midPoint = Math.floor(expenses.length / 2);
    const firstHalf = expenses.slice(0, midPoint);
    const secondHalf = expenses.slice(midPoint);

    const firstHalfAvg =
      firstHalf.reduce((sum, e) => sum + e.amount, 0) / firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, e) => sum + e.amount, 0) / secondHalf.length;

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (secondHalfAvg > firstHalfAvg * 1.1) {
      trend = 'increasing';
    } else if (secondHalfAvg < firstHalfAvg * 0.9) {
      trend = 'decreasing';
    }

    // Simple prediction: use average or trend-adjusted average
    let predictedNextExpense = averageExpense;
    if (trend === 'increasing') {
      predictedNextExpense = averageExpense * 1.1; // 10% increase
    } else if (trend === 'decreasing') {
      predictedNextExpense = averageExpense * 0.9; // 10% decrease
    }

    return NextResponse.json({
      success: true,
      data: {
        averageExpense: Math.round(averageExpense * 100) / 100,
        predictedNextExpense: Math.round(predictedNextExpense * 100) / 100,
        trend,
        recentExpenses: expenses.length,
      },
    });
  } catch (error: any) {
    console.error('Error calculating predictions:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to calculate predictions',
      },
      { status: 500 }
    );
  }
}

