import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const COOKIE_NAME = 'admin_session';
export const MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function hmac(data: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET manquant dans .env.local');
  return createHmac('sha256', secret).update(data).digest('hex');
}

export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !input) return false;
  return safeEqual(input, expected);
}

export function createSession() {
  const exp = String(Date.now() + MAX_AGE * 1000);
  return `${exp}.${hmac(exp)}`;
}

export async function isAdmin() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const [exp, sig] = token.split('.');
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now()) return false;

  return safeEqual(sig, hmac(exp));
}