/**
 * Expense Model
 * 
 * Mongoose schema for expense entries in the database
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the expense document interface
export interface IExpense extends Document {
  title: string;
  amount: number;
  category: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Define the expense schema
const ExpenseSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: [
        'Food',
        'Transport',
        'Shopping',
        'Bills',
        'Entertainment',
        'Healthcare',
        'Education',
        'Other',
      ],
      default: 'Other',
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create and export the model
// Use existing model if it exists (for Next.js hot reloading)
const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;

