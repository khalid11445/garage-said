import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';

const TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const MAX_SIZE = 4 * 1024 * 1024; // 4 Mo

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const f = form.get('file');
    if (f instanceof File) file = f;
  } catch {}

  if (!file) {
    return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 });
  }

  const ext = TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: 'Format accepté : JPG, PNG ou WebP' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Image trop lourde (4 Mo maximum)' }, { status: 400 });
  }

  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.storage
    .from('products')
    .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });

  if (error) {
    console.error('Erreur stockage:', error.message);
    return NextResponse.json({ error: "Échec de l'envoi de l'image" }, { status: 500 });
  }

  const { data } = supabase.storage.from('products').getPublicUrl(path);
  return NextResponse.json({ ok: true, url: data.publicUrl });
}