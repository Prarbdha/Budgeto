/**
 * Profile Page
 * 
 * Shows current user's profile info and allows signing out.
 */

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';
import { signoutAction } from '@/app/actions/auth';
import { format } from 'date-fns';

export default async function ProfilePage() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    redirect('/auth');
  }

  const session = await verifySession(token!);
  if (!session) {
    redirect('/auth');
  }

  await connectDB();
  const user = await User.findById(session.userId).lean();
  if (!user) {
    redirect('/auth');
  }

  const memberSince = user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : '—';

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Profile</h1>

      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="text-lg font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Member since</p>
          <p className="text-lg font-medium">{memberSince}</p>
        </div>

        <form action={signoutAction}>
          <button
            type="submit"
            className="mt-2 inline-flex items-center px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition-colors"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}


