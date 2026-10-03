import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const clip = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Row = { id: string; slug: string; name_fr: string; price: number; stock: number };

export async function POST(request: Request) {
  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }

  const customer_name = clip(data.name, 100);
  const phone = clip(data.phone, 30);
  const city = clip(data.city, 60);
  const address = clip(data.address, 300);
  const notes = clip(data.notes, 500);

  if (!customer_name || !phone || !city || !address) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }

  // Panier : on ne garde que l'identifiant et la quantité envoyés par le navigateur
  const rawItems = Array.isArray(data.items) ? data.items.slice(0, 20) : [];
  const wanted = new Map<string, number>();
  for (const raw of rawItems) {
    const it = raw as { id?: unknown; qty?: unknown };
    const qty = Number(it?.qty);
    if (typeof it?.id !== 'string' || !UUID.test(it.id) || !Number.isInteger(qty) || qty < 1) {
      return NextResponse.json({ error: 'Panier invalide' }, { status: 400 });
    }
    wanted.set(it.id, Math.min(10, (wanted.get(it.id) ?? 0) + qty));
  }
  if (wanted.size === 0) {
    return NextResponse.json({ error: 'Panier vide' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();

    // Les prix viennent de la base de données, jamais du navigateur
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, slug, name_fr, price, stock')
      .in('id', Array.from(wanted.keys()))
      .eq('active', true);

    if (fetchError) {
      console.error('Erreur Supabase:', fetchError.message);
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
    }

    const rows = (products ?? []) as Row[];
    if (rows.length !== wanted.size) {
      return NextResponse.json({ error: 'Produit indisponible' }, { status: 400 });
    }

    let total = 0;
    const items = [];
    for (const p of rows) {
      const qty = wanted.get(p.id)!;
      if (p.stock < qty) {
        return NextResponse.json({ error: 'stock' }, { status: 409 });
      }
      total += Number(p.price) * qty;
      items.push({ id: p.id, slug: p.slug, name: p.name_fr, price: Number(p.price), qty });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        customer_name,
        phone,
        city,
        address,
        notes: notes || null,
        items,
        total,
        payment_method: 'cod',
      })
      .select('id')
      .single();

    if (error || !order) {
      console.error('Erreur Supabase:', error?.message);
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, total, ref: String(order.id).slice(0, 8).toUpperCase() });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}