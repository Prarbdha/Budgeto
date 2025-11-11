/**
 * Expenses Page
 * 
 * Page for adding new expenses and viewing expense list
 */

'use client';

import { useState, useEffect } from 'react';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseTable from '@/components/ExpenseTable';

interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch expenses
  useEffect(() => {
    fetchExpenses();
  }, [refreshKey]);

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses');
      const data = await res.json();
      if (data.success) {
        setExpenses(data.data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    // Refresh the expense list
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Add Expense Form */}
        <div>
          <ExpenseForm onSuccess={handleFormSuccess} />
        </div>

        {/* Expense List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">All Expenses</h2>
          <ExpenseTable expenses={expenses} />
        </div>
      </div>
    </div>
  );
}

