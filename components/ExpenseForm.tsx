/**
 * ExpenseForm Component
 * 
 * A form component for adding new expenses
 * Includes voice input and OCR receipt upload features
 */

'use client';

import { useState, useRef, FormEvent } from 'react';
import { addExpense, AddExpenseFormData } from '@/app/actions/addExpense';
import VoiceInput from './VoiceInput';
import { extractTextFromImage, parseExpenseFromOCR } from '@/lib/ocr';

interface ExpenseFormProps {
  onSuccess?: () => void;
}

export default function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const [formData, setFormData] = useState<AddExpenseFormData>({
    title: '',
    amount: 0,
    category: 'Other',
    date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

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
    // Attempt to parse voice text like:
    // "Grocery 350 food", "Spent 120 on transport", "Movie 250 entertainment", "Bills 500"
    const text = transcript.toLowerCase();

    // Amount: detect ₹, rs, rupees, or plain number
    const amountMatch =
      text.match(/(?:₹|rs\.?\s*|rupees\s*)?(\d+(?:\.\d+)?)/) || [];
    const parsedAmount = amountMatch[1] ? parseFloat(amountMatch[1]) : undefined;

    // Category: match known categories
    const categories = [
      'food',
      'transport',
      'shopping',
      'bills',
      'entertainment',
      'healthcare',
      'education',
      'other',
    ] as const;
    const detectedCategory =
      categories.find((c) => text.includes(c)) || undefined;

    // Title: remove amount and category keywords to get remaining meaningful text
    let title = transcript;
    if (amountMatch[0]) {
      title = title.replace(new RegExp(amountMatch[0], 'i'), '').trim();
    }
    if (detectedCategory) {
      title = title.replace(new RegExp(detectedCategory, 'i'), '').trim();
    }
    // Remove common filler words
    title = title.replace(/\b(spent|for|on|of|the|a|an)\b/gi, '').trim();

    setFormData((prev) => ({
      ...prev,
      title: title || prev.title,
      amount: parsedAmount !== undefined ? parsedAmount : prev.amount,
      category: detectedCategory
        ? (detectedCategory.charAt(0).toUpperCase() +
            detectedCategory.slice(1)) as typeof prev.category
        : prev.category,
    }));
  };

  // Handle OCR file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file' });
      return;
    }

    setIsProcessingOCR(true);
    setMessage(null);

    try {
      // Extract text from image using OCR
      const ocrText = await extractTextFromImage(file);
      console.log('OCR Text:', ocrText);

      // Parse the OCR text to extract expense information
      const parsed = parseExpenseFromOCR(ocrText);

      // Update form with parsed data
      setFormData((prev) => ({
        ...prev,
        title: parsed.title || prev.title,
        amount: parsed.amount || prev.amount,
      }));

      setMessage({
        type: 'success',
        text: 'Receipt processed! Please review and adjust the fields.',
      });
    } catch (error: any) {
      console.error('OCR Error:', error);
      setMessage({
        type: 'error',
        text: 'Failed to process receipt. Please enter manually.',
      });
    } finally {
      setIsProcessingOCR(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await addExpense(formData);

      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Expense added successfully!' });
        // Reset form
        setFormData({
          title: '',
          amount: 0,
          category: 'Other',
          date: new Date().toISOString().split('T')[0],
        });
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Call success callback
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to add expense' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800">Add New Expense</h2>

      {/* Month Quick Select */}
      <div>
        <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
          Month
        </label>
        <input
          type="month"
          id="month"
          value={selectedMonth}
          onChange={(e) => {
            const m = e.target.value;
            setSelectedMonth(m);
            // If current date is within selected month, keep the day; otherwise, set to first day
            const [year, month] = m.split('-').map(Number);
            const current = new Date(formData.date);
            if (current.getFullYear() === year && current.getMonth() + 1 === month) {
              // same month, do nothing
            } else {
              const newDate = new Date(year, month - 1, 1);
              setFormData((prev) => ({ ...prev, date: newDate.toISOString().split('T')[0] }));
            }
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

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
            placeholder="e.g., Grocery Shopping"
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
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Shopping">Shopping</option>
          <option value="Bills">Bills</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Education">Education</option>
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

      {/* OCR Receipt Upload */}
      <div>
        <label htmlFor="receipt" className="block text-sm font-medium text-gray-700 mb-2">
          Upload Receipt (OCR)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          id="receipt"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={isProcessingOCR || isSubmitting}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
        />
        {isProcessingOCR && (
          <p className="mt-2 text-sm text-blue-600">Processing receipt...</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Upload a receipt image to automatically extract title and amount
        </p>
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
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Adding...' : 'Add Expense'}
      </button>
    </form>
  );
}

