/**
 * Budgets Page
 * 
 * Create/update a monthly budget and see utilization against expenses.
 */

'use client';

import { useEffect, useState, FormEvent } from 'react';
import { upsertBudgetAction } from '@/app/actions/budget';

interface Budget {
  _id: string;
  userId: string;
  month: string;
  amount: number;
}

export default function BudgetsPage() {
  const [month, setMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [amount, setAmount] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [existingBudgets, setExistingBudgets] = useState<Budget[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);

  useEffect(() => {
    fetchBudgets();
  }, []);

  useEffect(() => {
    fetchMonthlySummary(month);
    // load amount from existing budgets if present
    const found = existingBudgets.find((b) => b.month === month);
    setAmount(found ? found.amount : 0);
  }, [month, existingBudgets]);

  const fetchBudgets = async () => {
    try {
      const res = await fetch('/api/budgets');
      const data = await res.json();
      if (data.success) {
        setExistingBudgets(data.data);
      }
    } catch (e) {
      // ignore
    }
  };

  const fetchMonthlySummary = async (m: string) => {
    try {
      const res = await fetch(`/api/monthly-summary?month=${encodeURIComponent(m)}`);
      const data = await res.json();
      if (data.success) {
        setMonthlyTotal(data.data.totalExpenses || 0);
      } else {
        setMonthlyTotal(0);
      }
    } catch {
      setMonthlyTotal(0);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const result = await upsertBudgetAction({ month, amount });
      if (result.success) {
        setMessage({ type: 'success', text: 'Budget saved!' });
        fetchBudgets();
        fetchMonthlySummary(month);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save budget' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error saving budget' });
    } finally {
      setSaving(false);
    }
  };

  const currency = (v: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v);

  const utilization = amount > 0 ? Math.min(100, Math.round((monthlyTotal / amount) * 100)) : 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Budget Amount (₹)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Budget'}
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Spent</span>
            <span>{currency(monthlyTotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Budget</span>
            <span>{currency(amount)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full ${utilization >= 100 ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${utilization}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            Utilization: <span className={utilization >= 100 ? 'text-red-600 font-semibold' : 'font-medium'}>{utilization}%</span>
          </p>
        </div>
      </form>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Budgets</h2>
        {existingBudgets.length === 0 ? (
          <p className="text-gray-500">No budgets yet. Create one above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {existingBudgets.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{b.month}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">{currency(b.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


