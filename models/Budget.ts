/**
 * Budget Model
 * 
 * Monthly budget per user, keyed by month in YYYY-MM format.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBudget extends Document {
  userId: string;
  month: string; // 'YYYY-MM'
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema: Schema<IBudget> = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    month: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'],
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Budget cannot be negative'],
    },
  },
  { timestamps: true }
);

BudgetSchema.index({ userId: 1, month: 1 }, { unique: true });

const Budget: Model<IBudget> =
  mongoose.models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema);

export default Budget;


