import { NextResponse } from 'next/server';
import { checkPassword, createSession, COOKIE_NAME, MAX_AGE } from '@/lib/auth';

export async function POST(request: Request) {
  let password = '';
  try {
    const body = await request.json();
    password = typeof body.password === 'string' ? body.password : '';
  } catch {}

  if (!checkPassword(password)) {
    // Petit délai pour décourager les essais en série
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, createSession(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
  return res;
}