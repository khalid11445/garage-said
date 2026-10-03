import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { parseProduct, slugify } from '@/lib/productInput';

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }

  const parsed = parseProduct(data);
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const base = slugify(parsed.value.name_fr);

  // Si l'adresse (slug) existe déjà, on ajoute un petit suffixe aléatoire
  for (let attempt = 0; attempt < 3; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const { data: row, error } = await supabase
      .from('products')
      .insert({ ...parsed.value, slug })
      .select('*')
      .single();

    if (!error) return NextResponse.json({ ok: true, product: row });
    if (error.code !== '23505') {
      console.error('Erreur Supabase:', error.message);
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Impossible de créer le produit' }, { status: 500 });
}