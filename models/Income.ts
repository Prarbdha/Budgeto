/**
 * Income Model
 * 
 * Mongoose schema for income entries in the database
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the income document interface
export interface IIncome extends Document {
  title: string;
  amount: number;
  category: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Define the income schema
const IncomeSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Income title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Income amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: [
        'Salary',
        'Freelance',
        'Investment',
        'Business',
        'Gift',
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
const Income: Model<IIncome> =
  mongoose.models.Income || mongoose.model<IIncome>('Income', IncomeSchema);

export default Income;

