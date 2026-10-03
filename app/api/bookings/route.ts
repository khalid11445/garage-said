import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const clip = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

export async function POST(request: Request) {
  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }

  const name = clip(data.name, 100);
  const phone = clip(data.phone, 30);
  const brand = clip(data.brand, 50);
  const model = clip(data.model, 50);
  const service = clip(data.service, 30);
  const date = clip(data.date, 60);
  const time = clip(data.time, 10);

  if (!name || !phone || !brand || !model || !service || !date || !time) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }

  const symptoms = Array.isArray(data.symptoms)
    ? data.symptoms.filter((s): s is string => typeof s === 'string').slice(0, 10)
    : [];

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from('bookings').insert({
      name,
      phone,
      brand,
      model,
      plate: clip(data.plate, 20) || null,
      service,
      symptoms,
      description: clip(data.description, 1000) || null,
      booking_date: date,
      booking_time: time,
      locale: clip(data.locale, 5) || null,
    });

    if (error) {
      console.error('Erreur Supabase:', error.message);
      return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}