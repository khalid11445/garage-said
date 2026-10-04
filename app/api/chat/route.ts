import { NextResponse } from 'next/server';
import { buildSystemPrompt } from '@/lib/chatPrompt';

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_HISTORY = 12; // derniers messages envoyés
const MAX_CHARS = 600; // longueur maximale d'un message
const DAILY_LIMIT = 40; // messages par visiteur et par jour

type Msg = { role: 'user' | 'assistant'; content: string };

// Limite simple en mémoire (best effort : elle peut se réinitialiser quand le serveur redémarre)
const usage = new Map<string, { day: string; count: number }>();

function tooMany(ip: string) {
  const day = new Date().toISOString().slice(0, 10);
  if (usage.size > 5000) usage.clear();
  const rec = usage.get(ip);
  if (!rec || rec.day !== day) {
    usage.set(ip, { day, count: 1 });
    return false;
  }
  rec.count++;
  return rec.count > DAILY_LIMIT;
}

export async function POST(request: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    console.error('ANTHROPIC_API_KEY manquante');
    return NextResponse.json({ error: 'config' }, { status: 500 });
  }

  const ip = (request.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();
  if (tooMany(ip)) {
    return NextResponse.json({ error: 'limit' }, { status: 429 });
  }

  let body: { messages?: unknown; locale?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }

  const raw = Array.isArray(body.messages) ? body.messages : [];
  const messages: Msg[] = [];
  for (const m of raw.slice(-MAX_HISTORY)) {
    const role = (m as { role?: unknown })?.role;
    const content = (m as { content?: unknown })?.content;
    if ((role === 'user' || role === 'assistant') && typeof content === 'string' && content.trim()) {
      messages.push({ role, content: content.trim().slice(0, MAX_CHARS) });
    }
  }
  while (messages.length && messages[0].role !== 'user') messages.shift();
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }

  const locale = body.locale === 'ar' ? 'ar' : 'fr';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        system: buildSystemPrompt(locale),
        messages,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      console.error('Erreur API chat:', res.status, detail);
      return NextResponse.json({ error: 'api' }, { status: 502 });
    }

    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const reply = (data.content ?? [])
      .filter((b) => b.type === 'text' && b.text)
      .map((b) => b.text)
      .join('\n')
      .trim();

    if (!reply) return NextResponse.json({ error: 'empty' }, { status: 502 });
    return NextResponse.json({ reply });
  } catch (e) {
    console.error('Erreur chat:', e);
    return NextResponse.json({ error: 'api' }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}