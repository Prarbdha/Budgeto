/**
 * Auth Utilities
 * 
 * Password hashing/verification and JWT session helpers
 */

import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

// Cookie name for session token
export const SESSION_COOKIE = 'budgeto_session';

// Read secret from env; in production always set AUTH_SECRET
function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || 'dev-secret-change-me';
  return new TextEncoder().encode(secret);
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export interface SessionPayload {
  userId: string;
  email: string;
  [key: string]: unknown;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}


