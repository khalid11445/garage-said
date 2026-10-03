import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { parseProduct } from '@/lib/productInput';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { id } = await params;

  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Cas simple : masquer ou afficher un produit
  if (Object.keys(data).length === 1 && typeof data.active === 'boolean') {
    const { data: row, error } = await supabase
      .from('products')
      .update({ active: data.active })
      .eq('id', id)
      .select('*')
      .single();
    if (error) {
      console.error('Erreur Supabase:', error.message);
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
    }
    return NextResponse.json({ ok: true, product: row });
  }

  const parsed = parseProduct(data);
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { data: row, error } = await supabase
    .from('products')
    .update(parsed.value)
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Erreur Supabase:', error.message);
    return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, product: row });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    console.error('Erreur Supabase:', error.message);
    return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}