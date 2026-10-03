'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useCart, MAX_QTY } from '@/lib/cart';
import { pick } from '@/lib/products';
import { whatsappLink } from '@/lib/config';

const inputClass =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand';

export default function CartView() {
  const t = useTranslations('Cart');
  const locale = useLocale();
  const { items, ready, total, setQty, remove, clear } = useCart();

  const [form, setForm] = useState({ name: '', phone: '', city: '', address: '', notes: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ ref: string; total: number; summary: string } | null>(null);

  const update = (field: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const valid = form.name.trim() && form.phone.trim() && form.city.trim() && form.address.trim();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({ id: i.id, qty: i.qty })),
          locale,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error === 'stock' ? t('stockError') : t('error'));
        setSending(false);
        return;
      }
      const summary = items
        .map((i) => `${i.qty} x ${pick(locale, i.name_fr, i.name_ar)} - ${i.qty * i.price} ${t('currency')}`)
        .join('\n');
      setDone({ ref: data.ref, total: data.total, summary });
      clear();
    } catch {
      setError(t('error'));
    }
    setSending(false);
  };

  if (!ready) return null;

  if (done) {
    const message = [
      `${t('whatsappIntro')} #${done.ref}`,
      done.summary,
      `${t('totalLabel')}: ${done.total} ${t('currency')}`,
      `${form.name} - ${form.phone}`,
      `${form.city}, ${form.address}`,
    ].join('\n');

    return (
      <div className="rounded-2xl border border-green-500/40 bg-green-500/10 p-8 text-center">
        <p className="text-5xl">✅</p>
        <h1 className="mt-4 text-2xl font-extrabold">{t('successTitle')}</h1>
        <p className="mt-2 text-sm text-gray-500">
          {t('refLabel')} : <strong dir="ltr">#{done.ref}</strong>
        </p>
        <p className="mt-4 text-gray-700">{t('successText')}</p>
        <a
          href={whatsappLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-full bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
        >
          {t('whatsappButton')}
        </a>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-5xl">🛒</p>
        <h1 className="mt-4 text-2xl font-extrabold">{t('title')}</h1>
        <p className="mt-2 text-gray-500">{t('empty')}</p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
        >
          {t('browse')}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold">{t('title')}</h1>

      <div className="mt-6 space-y-3">
        {items.map((i) => (
          <div
            key={i.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-soft p-4"
          >
            <div>
              <p className="font-bold">{pick(locale, i.name_fr, i.name_ar)}</p>
              <p className="text-sm text-gray-500">
                {i.price} {t('currency')}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-full border border-gray-300">
                <button
                  type="button"
                  onClick={() => setQty(i.id, i.qty - 1)}
                  disabled={i.qty <= 1}
                  className="h-9 w-9 text-lg disabled:opacity-30"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold">{i.qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(i.id, i.qty + 1)}
                  disabled={i.qty >= MAX_QTY}
                  className="h-9 w-9 text-lg disabled:opacity-30"
                >
                  +
                </button>
              </div>
              <p className="w-24 text-end font-bold">
                {i.qty * i.price} {t('currency')}
              </p>
              <button
                type="button"
                onClick={() => remove(i.id)}
                className="text-sm text-red-400 hover:underline"
              >
                {t('remove')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-soft p-4 text-lg font-extrabold">
        <span>{t('totalLabel')}</span>
        <span className="text-brand">
          {total} {t('currency')}
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-500">{t('deliveryInfo')}</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <h2 className="text-xl font-bold">{t('formTitle')}</h2>

        <label className="block text-sm font-medium">
          {t('name')}
          <input className={inputClass} value={form.name} onChange={(e) => update('name', e.target.value)} />
        </label>
        <label className="block text-sm font-medium">
          {t('phone')}
          <input
            className={inputClass}
            dir="ltr"
            type="tel"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium">
          {t('city')}
          <input className={inputClass} value={form.city} onChange={(e) => update('city', e.target.value)} />
        </label>
        <label className="block text-sm font-medium">
          {t('address')}
          <textarea
            className={`${inputClass} h-20`}
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium">
          {t('notes')}
          <textarea
            className={`${inputClass} h-16`}
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
          />
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={!valid || sending}
          className="btn-glow w-full rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          {sending ? t('sending') : t('submit')}
        </button>
      </form>
    </div>
  );
}