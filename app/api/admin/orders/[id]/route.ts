import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

const STATUSES = ['new', 'confirmed', 'delivered', 'cancelled'];

type OrderItem = { id: string; qty: number };

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

  const { data: order, error: readError } = await supabase
    .from('orders')
    .select('id, items, stock_deducted')
    .eq('id', id)
    .maybeSingle();

  if (readError) {
    console.error('Erreur Supabase:', readError.message);
    return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
  }
  if (!order) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
  }

  const items = (Array.isArray(order.items) ? order.items : []) as OrderItem[];
  let deducted = Boolean(order.stock_deducted);

  const shouldDeduct = (status === 'confirmed' || status === 'delivered') && !deducted;
  const shouldRestore = status === 'cancelled' && deducted;

  if (shouldDeduct || shouldRestore) {
    const sign = shouldDeduct ? -1 : 1;
    for (const it of items) {
      const { error } = await supabase.rpc('adjust_stock', {
        p_id: it.id,
        p_delta: sign * Number(it.qty),
      });
      if (error) {
        console.error('Erreur stock:', error.message);
        return NextResponse.json({ error: 'Erreur de mise à jour du stock' }, { status: 500 });
      }
    }
    deducted = shouldDeduct;
  }

  const { error } = await supabase
    .from('orders')
    .update({ status, stock_deducted: deducted })
    .eq('id', id);

  if (error) {
    console.error('Erreur Supabase:', error.message);
    return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}