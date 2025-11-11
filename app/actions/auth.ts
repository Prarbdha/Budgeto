/**
 * Server Actions: Auth (Sign Up / Sign In / Sign Out)
 */

'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { redirect } from 'next/navigation';
import { hashPassword, verifyPassword, signSession, SESSION_COOKIE } from '@/lib/auth';

export async function signupAction(formData: {
  email: string;
  password: string;
}) {
  try {
    const email = formData.email?.toLowerCase().trim();
    const password = formData.password;

    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    await connectDB();

    const exists = await User.findOne({ email });
    if (exists) {
      return { success: false, error: 'Email already in use' };
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({ email, passwordHash });

    const token = await signSession({ userId: String(user._id), email });
    cookies().set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to sign up' };
  }
}

export async function signinAction(formData: {
  email: string;
  password: string;
}) {
  try {
    const email = formData.email?.toLowerCase().trim();
    const password = formData.password;

    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return { success: false, error: 'Invalid credentials' };
    }

    const token = await signSession({ userId: String(user._id), email });
    cookies().set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to sign in' };
  }
}

export async function signoutAction() {
 
}



