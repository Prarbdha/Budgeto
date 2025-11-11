/**
 * Auth Page
 * 
 * Simple email/password Sign Up and Sign In using Server Actions.
 */

'use client';

import { useState, FormEvent } from 'react';
import { signupAction, signinAction } from '@/app/actions/auth';
import Link from 'next/link';

export default function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const action = mode === 'signup' ? signupAction : signinAction;
      const res = await action({ email, password });
      if (res.success) {
        setMessage({ type: 'success', text: mode === 'signup' ? 'Account created! Redirecting...' : 'Signed in! Redirecting...' });
        // Optional: navigate to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 600);
      } else {
        setMessage({ type: 'error', text: res.error || 'Authentication failed' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
          <p className="text-sm text-gray-500">
            {mode === 'signup' ? 'Sign up to start using Budgeto' : 'Sign in to continue to Budgeto'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white ${mode === 'signup' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} transition-colors disabled:opacity-50`}
          >
            {loading ? (mode === 'signup' ? 'Creating account...' : 'Signing in...') : (mode === 'signup' ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600">
          {mode === 'signup' ? (
            <span>
              Already have an account?{' '}
              <button className="text-blue-600 hover:underline" onClick={() => setMode('signin')}>
                Sign in
              </button>
            </span>
          ) : (
            <span>
              New to Budgeto?{' '}
              <button className="text-blue-600 hover:underline" onClick={() => setMode('signup')}>
                Create an account
              </button>
            </span>
          )}
        </div>

        <div className="text-center">
          <Link href="/dashboard" className="text-xs text-gray-500 hover:text-gray-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}


