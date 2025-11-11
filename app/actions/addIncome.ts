/**
 * Server Action: Add Income
 * 
 * This server action handles adding new income entries to the database
 */

'use server';

import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/mongodb';
import Income from '@/models/Income';

export interface AddIncomeFormData {
  title: string;
  amount: number;
  category: string;
  date: string;
}

/**
 * Server Action to add a new income entry
 * @param formData - Form data containing income details
 * @returns Object with success status and message/error
 */
export async function addIncome(formData: AddIncomeFormData) {
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

    // Create new income entry
    const income = new Income({
      title: formData.title.trim(),
      amount: parseFloat(formData.amount.toString()),
      category: formData.category,
      date: new Date(formData.date),
    });

    // Save to database
    await income.save();

    // Revalidate the dashboard and income pages to show updated data
    revalidatePath('/dashboard');
    revalidatePath('/income');

    return {
      success: true,
      message: 'Income added successfully!',
      data: income,
    };
  } catch (error: any) {
    console.error('Error adding income:', error);
    return {
      success: false,
      error: error.message || 'Failed to add income',
    };
  }
}

