'use client';

import { useState } from 'react';

type OrderItem = { id: string; slug: string; name: string; price: number; qty: number };

export type Order = {
  id: string;
  created_at: string;
  customer_name: string;
  phone: string;
  city: string;
  address: string;
  notes: string | null;
  items: OrderItem[];
  total: number;
  status: string;
};

const STATUS: Record<string, { label: string; className: string }> = {
  new: { label: 'Nouvelle', className: 'bg-brand text-white' },
  confirmed: { label: 'Confirmée', className: 'bg-green-600 text-white' },
  delivered: { label: 'Livrée', className: 'bg-gray-500 text-white' },
  cancelled: { label: 'Annulée', className: 'bg-gray-700 text-gray-300' },
};

const FILTERS = ['all', 'new', 'confirmed', 'delivered', 'cancelled'] as const;

function waNumber(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('212')) return digits;
  if (digits.startsWith('0')) return '212' + digits.slice(1);
  return digits;
}

export default function OrdersTable({ initial }: { initial: Order[] }) {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const [busy, setBusy] = useState<string | null>(null);

  const setStatus = async (id: string, status: string) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      if (!res.ok) throw new Error('failed');
      setItems((list) => list.map((o) => (o.id === id ? { ...o, status } : o)));
    } catch {
      alert('Impossible de modifier le statut. Réessayez.');
    }
    setBusy(null);
  };

  const count = (s: string) => (s === 'all' ? items.length : items.filter((o) => o.status === s).length);
  const shown = filter === 'all' ? items : items.filter((o) => o.status === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
              filter === f ? 'border-brand bg-brand text-white' : 'border-gray-300 hover:bg-soft'
            }`}
          >
            {f === 'all' ? 'Toutes' : STATUS[f].label} ({count(f)})
          </button>
        ))}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="ms-auto rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium hover:bg-soft"
        >
          Actualiser
        </button>
      </div>

      {shown.length === 0 ? (
        <p className="mt-8 rounded-xl bg-soft p-6 text-center text-gray-500">
          Aucune commande ici pour l&apos;instant.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {shown.map((o) => {
            const ref = o.id.slice(0, 8).toUpperCase();
            const msg = `Bonjour ${o.customer_name}, votre commande #${ref} au Garage Said est confirmée (${o.total} DH, paiement à la livraison). Nous vous contactons pour la livraison.`;
            const waLink = `https://wa.me/${waNumber(o.phone)}?text=${encodeURIComponent(msg)}`;
            const disabled = busy === o.id;
            const lines = Array.isArray(o.items) ? o.items : [];

            return (
              <div key={o.id} className="rounded-2xl border border-gray-200 bg-soft p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold">{o.customer_name}</p>
                    <p dir="ltr" className="text-sm text-gray-500">{o.phone}</p>
                  </div>
                  <div className="text-end">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS[o.status]?.className ?? ''}`}>
                      {STATUS[o.status]?.label ?? o.status}
                    </span>
                    <p dir="ltr" className="mt-2 text-xs text-gray-500">#{ref}</p>
                  </div>
                </div>

                <ul className="mt-4 space-y-1 text-sm">
                  {lines.map((l) => (
                    <li key={l.id} className="flex justify-between gap-3">
                      <span>
                        {l.qty} × {l.name}
                      </span>
                      <span className="text-gray-500">{l.qty * l.price} DH</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 flex justify-between border-t border-gray-200 pt-3 font-bold">
                  <span>Total (à payer en espèces)</span>
                  <span className="text-brand">{o.total} DH</span>
                </p>

                <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <p>
                    <span className="text-gray-500">Ville : </span>
                    {o.city}
                  </p>
                  <p>
                    <span className="text-gray-500">Reçue le : </span>
                    <span suppressHydrationWarning>{new Date(o.created_at).toLocaleString('fr-FR')}</span>
                  </p>
                </div>
                <p className="mt-2 text-sm">
                  <span className="text-gray-500">Adresse : </span>
                  {o.address}
                </p>
                {o.notes && (
                  <p className="mt-2 text-sm">
                    <span className="text-gray-500">Remarques : </span>
                    {o.notes}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {o.status === 'new' && (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => setStatus(o.id, 'confirmed')}
                      className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      Confirmer
                    </button>
                  )}
                  {(o.status === 'new' || o.status === 'confirmed') && (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => setStatus(o.id, 'delivered')}
                      className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-black disabled:opacity-50"
                    >
                      Livrée
                    </button>
                  )}
                  {o.status !== 'cancelled' && o.status !== 'delivered' && (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => setStatus(o.id, 'cancelled')}
                      className="rounded-full border border-red-500/50 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                    >
                      Annuler
                    </button>
                  )}
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-green-500/50 px-4 py-2 text-sm font-medium text-green-400 hover:bg-green-500/10"
                  >
                    WhatsApp client
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}