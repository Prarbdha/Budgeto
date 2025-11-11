/**
 * Server Action: Add Expense
 * 
 * This server action handles adding new expense entries to the database
 * Uses Next.js Server Actions (no API route needed)
 */

'use server';

import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/mongodb';
import Expense from '@/models/Expense';

export interface AddExpenseFormData {
  title: string;
  amount: number;
  category: string;
  date: string;
}

/**
 * Server Action to add a new expense
 * @param formData - Form data containing expense details
 * @returns Object with success status and message/error
 */
export async function addExpense(formData: AddExpenseFormData) {
  try {
    // Validate input
    if (!formData.title || !formData.amount || !formData.category || !formData.date) {
      return {
        success: false,
        error: 'All fields are required',
      };
    }

    // Connect to database
    await connectDB();

    // Create new expense
    const expense = new Expense({
      title: formData.title.trim(),
      amount: parseFloat(formData.amount.toString()),
      category: formData.category,
      date: new Date(formData.date),
    });

    // Save to database
    await expense.save();

    // Revalidate the dashboard and expenses pages to show updated data
    revalidatePath('/dashboard');
    revalidatePath('/expenses');

    return {
      success: true,
      message: 'Expense added successfully!',
      data: expense,
    };
  } catch (error: any) {
    console.error('Error adding expense:', error);
    return {
      success: false,
      error: error.message || 'Failed to add expense',
    };
  }
}

