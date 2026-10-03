'use client';

import { useState } from 'react';

export type Booking = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  brand: string;
  model: string;
  plate: string | null;
  service: string;
  symptoms: string[] | null;
  description: string | null;
  booking_date: string;
  booking_time: string;
  status: string;
};

const SERVICES: Record<string, string> = {
  mechanic: 'Mécanique générale',
  bodywork: 'Carrosserie',
  tires: 'Pneus',
  oil: 'Vidange',
  inspection: 'Contrôle technique',
  diagnostic: 'Diagnostic',
};

const SYMPTOMS: Record<string, string> = {
  noise: 'Bruit anormal',
  warning: 'Voyant allumé',
  vibration: 'Vibrations',
  start: 'Démarrage difficile',
  overheat: 'Moteur qui chauffe',
  brakes: 'Freins',
};

const STATUS: Record<string, { label: string; className: string }> = {
  new: { label: 'Nouveau', className: 'bg-brand text-white' },
  confirmed: { label: 'Confirmé', className: 'bg-green-600 text-white' },
  done: { label: 'Terminé', className: 'bg-gray-500 text-white' },
  cancelled: { label: 'Annulé', className: 'bg-gray-700 text-gray-300' },
};

const FILTERS = ['all', 'new', 'confirmed', 'done', 'cancelled'] as const;

function waNumber(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('212')) return digits;
  if (digits.startsWith('0')) return '212' + digits.slice(1);
  return digits;
}

export default function BookingsTable({ initial }: { initial: Booking[] }) {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const [busy, setBusy] = useState<string | null>(null);

  const setStatus = async (id: string, status: string) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      if (!res.ok) throw new Error('failed');
      setItems((list) => list.map((b) => (b.id === id ? { ...b, status } : b)));
    } catch {
      alert('Impossible de modifier le statut. Réessayez.');
    }
    setBusy(null);
  };

  const count = (s: string) => (s === 'all' ? items.length : items.filter((b) => b.status === s).length);
  const shown = filter === 'all' ? items : items.filter((b) => b.status === filter);

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
            {f === 'all' ? 'Tous' : STATUS[f].label} ({count(f)})
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
        <p className="mt-8 rounded-xl bg-soft p-6 text-center text-gray-500">Aucun rendez-vous ici pour l&apos;instant.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {shown.map((b) => {
            const confirmMsg = `Bonjour ${b.name}, votre rendez-vous au Garage Said est confirmé : ${b.booking_date} à ${b.booking_time}. À bientôt !`;
            const waLink = `https://wa.me/${waNumber(b.phone)}?text=${encodeURIComponent(confirmMsg)}`;
            const disabled = busy === b.id;

            return (
              <div key={b.id} className="rounded-2xl border border-gray-200 bg-soft p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold">{b.name}</p>
                    <p dir="ltr" className="text-sm text-gray-500">{b.phone}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS[b.status]?.className ?? ''}`}>
                    {STATUS[b.status]?.label ?? b.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <p>
                    <span className="text-gray-500">Véhicule : </span>
                    {b.brand} {b.model}
                    {b.plate ? ` (${b.plate})` : ''}
                  </p>
                  <p>
                    <span className="text-gray-500">Service : </span>
                    {SERVICES[b.service] ?? b.service}
                  </p>
                  <p>
                    <span className="text-gray-500">Rendez-vous : </span>
                    <strong>{b.booking_date} à {b.booking_time}</strong>
                  </p>
                  <p>
                    <span className="text-gray-500">Reçu le : </span>
                    <span suppressHydrationWarning>{new Date(b.created_at).toLocaleString('fr-FR')}</span>
                  </p>
                </div>

                {b.symptoms && b.symptoms.length > 0 && (
                  <p className="mt-3 text-sm">
                    <span className="text-gray-500">Symptômes : </span>
                    {b.symptoms.map((s) => SYMPTOMS[s] ?? s).join(', ')}
                  </p>
                )}
                {b.description && (
                  <p className="mt-2 text-sm">
                    <span className="text-gray-500">Description : </span>
                    {b.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {b.status !== 'confirmed' && (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => setStatus(b.id, 'confirmed')}
                      className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      Confirmer
                    </button>
                  )}
                  {b.status !== 'done' && (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => setStatus(b.id, 'done')}
                      className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-black disabled:opacity-50"
                    >
                      Terminé
                    </button>
                  )}
                  {b.status !== 'cancelled' && (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => setStatus(b.id, 'cancelled')}
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