'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { whatsappLink } from '@/lib/config';

type Msg = { role: 'user' | 'assistant'; content: string };

export default function ChatWidget() {
  const t = useTranslations('Chat');
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, open]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const next: Msg[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) setError(t('limit'));
      else if (!res.ok || !data.reply) setError(t('error'));
      else setMessages([...next, { role: 'assistant', content: data.reply }]);
    } catch {
      setError(t('error'));
    }
    setLoading(false);
  };

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label={t('title')}
          className="fade-up fixed bottom-40 end-5 z-50 flex h-[28rem] max-h-[calc(100vh-11rem)] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#0b0b0c] shadow-2xl shadow-black/60"
        >
          <div className="flex items-center justify-between bg-brand px-4 py-3 text-white">
            <div>
              <p className="font-bold">{t('title')}</p>
              <p className="text-xs opacity-90">{t('subtitle')}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('close')}
              className="text-2xl leading-none opacity-90 hover:opacity-100"
            >
              ×
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            <div className="me-auto w-fit max-w-[85%] whitespace-pre-wrap rounded-2xl bg-white/10 px-3 py-2 text-gray-100">
              {t('greeting')}
            </div>

            {messages.map((m, i) => (
              <div
                key={i}
                className={`w-fit max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 ${
                  m.role === 'user' ? 'ms-auto bg-brand text-white' : 'me-auto bg-white/10 text-gray-100'
                }`}
              >
                {m.content}
              </div>
            ))}

            {loading && (
              <div className="me-auto w-fit rounded-2xl bg-white/10 px-3 py-2 text-gray-400">{t('typing')}</div>
            )}
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div ref={endRef} />
          </div>

          <div className="flex gap-2 border-t border-white/10 px-4 py-2 text-xs">
            <Link href="/booking" onClick={() => setOpen(false)} className="font-semibold text-brand hover:underline">
              {t('book')}
            </Link>
            <span className="text-gray-600">·</span>
            <a
              href={whatsappLink(t('whatsappMessage'))}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-green-400 hover:underline"
            >
              WhatsApp
            </a>
          </div>

          <form onSubmit={send} className="flex gap-2 border-t border-white/10 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={600}
              placeholder={t('placeholder')}
              className="min-w-0 flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-brand"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-40"
            >
              {t('send')}
            </button>
          </form>
          <p className="px-4 pb-2 text-center text-[10px] text-gray-500">{t('disclaimer')}</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={t('open')}
        className="fixed bottom-24 end-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-2xl text-white shadow-lg shadow-red-900/40 transition hover:scale-110"
      >
        {open ? '×' : '🤖'}
      </button>
    </>
  );
}