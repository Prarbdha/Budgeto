/**
 * Dashboard Page
 * 
 * Displays financial summary, expense list, and charts
 * Shows total income, total expenses, balance, and predictions
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ExpenseTable from '@/components/ExpenseTable';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
}

interface Income {
  _id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
}

interface Prediction {
  averageExpense: number;
  predictedNextExpense: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  recentExpenses: number;
}

export default function DashboardPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [predictions, setPredictions] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch expenses
      const expensesRes = await fetch('/api/expenses');
      const expensesData = await expensesRes.json();
      if (expensesData.success) {
        setExpenses(expensesData.data);
      }

      // Fetch income
      const incomeRes = await fetch('/api/income');
      const incomeData = await incomeRes.json();
      if (incomeData.success) {
        setIncome(incomeData.data);
      }

      // Fetch predictions
      const predictionsRes = await fetch('/api/predictions');
      const predictionsData = await predictionsRes.json();
      if (predictionsData.success) {
        setPredictions(predictionsData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Prepare chart data (last 7 days)
  const prepareChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map((date) => {
      const dayExpenses = expenses
        .filter((e) => e.date.startsWith(date))
        .reduce((sum, e) => sum + e.amount, 0);
      const dayIncome = income
        .filter((i) => i.date.startsWith(date))
        .reduce((sum, i) => sum + i.amount, 0);

      return {
        date: format(new Date(date), 'MMM dd'),
        expenses: dayExpenses,
        income: dayIncome,
      };
    });
  };

  // Prepare category data
  const prepareCategoryData = () => {
    const categoryMap = new Map<string, number>();
    expenses.forEach((expense) => {
      const current = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, current + expense.amount);
    });

    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-4">
          <Link
            href="/expenses"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Expense
          </Link>
          <Link
            href="/income"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Income
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Income</h3>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Expenses</h3>
          <p className="text-3xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Balance</h3>
          <p
            className={`text-3xl font-bold ${
              balance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(balance)}
          </p>
        </div>
      </div>

      {/* Predictions Section */}
      {predictions && predictions.recentExpenses > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Expense Predictions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Average Expense</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(predictions.averageExpense)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Predicted Next Expense</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(predictions.predictedNextExpense)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Trend</p>
              <p className="text-2xl font-bold">
                {predictions.trend === 'increasing' && '📈 Increasing'}
                {predictions.trend === 'decreasing' && '📉 Decreasing'}
                {predictions.trend === 'stable' && '➡️ Stable'}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Based on last {predictions.recentExpenses} expense entries
          </p>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Last 7 Days</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={prepareChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                strokeWidth={2}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                strokeWidth={2}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Expenses by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareCategoryData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="amount" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Expenses */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Expenses</h2>
          <Link
            href="/expenses"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All →
          </Link>
        </div>
        <ExpenseTable expenses={expenses.slice(0, 10)} />
      </div>
    </div>
  );
}

