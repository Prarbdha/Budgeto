/**
 * IncomeForm Component
 * 
 * A form component for adding new income entries
 * Similar to ExpenseForm but for income
 */

'use client';

import { useState, useRef, FormEvent } from 'react';
import { addIncome, AddIncomeFormData } from '@/app/actions/addIncome';
import VoiceInput from './VoiceInput';

interface IncomeFormProps {
  onSuccess?: () => void;
}

export default function IncomeForm({ onSuccess }: IncomeFormProps) {
  const [formData, setFormData] = useState<AddIncomeFormData>({
    title: '',
    amount: 0,
    category: 'Other',
    date: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
  };

  // Handle voice input transcript
  const handleVoiceTranscript = (transcript: string) => {
    setFormData((prev) => ({
      ...prev,
      title: transcript,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await addIncome(formData);

      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Income added successfully!' });
        // Reset form
        setFormData({
          title: '',
          amount: 0,
          category: 'Other',
          date: new Date().toISOString().split('T')[0],
        });
        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to add income' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800">Add New Income</h2>

      {/* Title Field */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Monthly Salary"
          />
          <VoiceInput onTranscript={handleVoiceTranscript} disabled={isSubmitting} />
        </div>
      </div>

      {/* Amount Field */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
          Amount (₹) *
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount || ''}
          onChange={handleChange}
          required
          min="0"
          step="0.01"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0.00"
        />
      </div>

      {/* Category Field */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          Category *
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="Salary">Salary</option>
          <option value="Freelance">Freelance</option>
          <option value="Investment">Investment</option>
          <option value="Business">Business</option>
          <option value="Gift">Gift</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Date Field */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
          Date *
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`p-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Adding...' : 'Add Income'}
      </button>
    </form>
  );
}

