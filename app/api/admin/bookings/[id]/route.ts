import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

const STATUSES = ['new', 'confirmed', 'done', 'cancelled'];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { id } = await params;

  let status = '';
  try {
    const body = await request.json();
    status = typeof body.status === 'string' ? body.status : '';
  } catch {}

  if (!STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id);

  if (error) {
    console.error('Erreur Supabase:', error.message);
    return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}