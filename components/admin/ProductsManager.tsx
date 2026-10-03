'use client';

import { useState } from 'react';
import { CATEGORIES, CATEGORY_ICONS } from '@/lib/products';

export type AdminProduct = {
  id: string;
  slug: string;
  name_fr: string;
  name_ar: string | null;
  description_fr: string | null;
  description_ar: string | null;
  price: number;
  category: string;
  image_url: string | null;
  stock: number;
  active: boolean;
};

const CATEGORY_LABELS: Record<string, string> = {
  oil: 'Huiles',
  filters: 'Filtres',
  interior: 'Intérieur',
  electronics: 'Électronique',
};

const emptyForm = {
  name_fr: '',
  name_ar: '',
  description_fr: '',
  description_ar: '',
  price: '',
  stock: '',
  category: 'oil',
  image_url: '',
  active: true,
};

const inputClass =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand focus:ring-1 focus:ring-brand';

export default function ProductsManager({ initial }: { initial: AdminProduct[] }) {
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<AdminProduct | 'new' | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const update = (field: keyof typeof emptyForm, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const openNew = () => {
    setForm(emptyForm);
    setError('');
    setEditing('new');
  };

  const openEdit = (p: AdminProduct) => {
    setForm({
      name_fr: p.name_fr,
      name_ar: p.name_ar ?? '',
      description_fr: p.description_fr ?? '',
      description_ar: p.description_ar ?? '',
      price: String(p.price),
      stock: String(p.stock),
      category: p.category,
      image_url: p.image_url ?? '',
      active: p.active,
    });
    setError('');
    setEditing(p);
  };

  const close = () => {
    if (!saving && !uploading) setEditing(null);
  };

  const redirectIfExpired = (status: number) => {
    if (status === 401) {
      window.location.href = '/admin/login';
      return true;
    }
    return false;
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body });
      if (redirectIfExpired(res.status)) return;
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Échec de l'envoi de l'image");
      } else {
        update('image_url', data.url);
      }
    } catch {
      setError("Échec de l'envoi de l'image");
    }
    setUploading(false);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError('');

    const isNew = editing === 'new';
    const url = isNew ? '/api/admin/products' : `/api/admin/products/${editing.id}`;

    try {
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (redirectIfExpired(res.status)) return;
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Erreur lors de l’enregistrement');
        setSaving(false);
        return;
      }
      const saved = data.product as AdminProduct;
      setItems((list) =>
        isNew ? [saved, ...list] : list.map((p) => (p.id === saved.id ? saved : p))
      );
      setEditing(null);
    } catch {
      setError('Erreur de connexion. Réessayez.');
    }
    setSaving(false);
  };

  const toggleActive = async (p: AdminProduct) => {
    setBusy(p.id);
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !p.active }),
      });
      if (redirectIfExpired(res.status)) return;
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setItems((list) => list.map((x) => (x.id === p.id ? (data.product as AdminProduct) : x)));
    } catch {
      alert('Impossible de modifier le produit. Réessayez.');
    }
    setBusy(null);
  };

  const remove = async (p: AdminProduct) => {
    if (!confirm(`Supprimer définitivement « ${p.name_fr} » ?`)) return;
    setBusy(p.id);
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, { method: 'DELETE' });
      if (redirectIfExpired(res.status)) return;
      if (!res.ok) throw new Error('failed');
      setItems((list) => list.filter((x) => x.id !== p.id));
    } catch {
      alert('Impossible de supprimer le produit. Réessayez.');
    }
    setBusy(null);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">{items.length} produit(s)</p>
        <button
          type="button"
          onClick={openNew}
          className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          + Ajouter un produit
        </button>
      </div>

      {items.length === 0 ? (
        <p className="mt-8 rounded-xl bg-soft p-6 text-center text-gray-500">
          Aucun produit pour l&apos;instant.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((p) => (
            <div
              key={p.id}
              className={`flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200 bg-soft p-4 ${
                p.active ? '' : 'opacity-60'
              }`}
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black/40 text-3xl">
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt={p.name_fr} className="h-full w-full object-cover" />
                ) : (
                  CATEGORY_ICONS[p.category] ?? '🔧'
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold">
                  {p.name_fr}
                  {!p.active && (
                    <span className="ms-2 rounded-full bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-300">
                      Masqué
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  {CATEGORY_LABELS[p.category] ?? p.category} · {Number(p.price)} DH ·{' '}
                  <span className={p.stock === 0 ? 'font-semibold text-red-400' : p.stock <= 5 ? 'text-yellow-400' : ''}>
                    stock : {p.stock}
                  </span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy === p.id}
                  onClick={() => openEdit(p)}
                  className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-black disabled:opacity-50"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  disabled={busy === p.id}
                  onClick={() => toggleActive(p)}
                  className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-black disabled:opacity-50"
                >
                  {p.active ? 'Masquer' : 'Afficher'}
                </button>
                <button
                  type="button"
                  disabled={busy === p.id}
                  onClick={() => remove(p)}
                  className="rounded-full border border-red-500/50 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-4"
          onClick={close}
        >
          <form
            onSubmit={save}
            onClick={(e) => e.stopPropagation()}
            className="my-8 w-full max-w-lg space-y-4 rounded-2xl border border-gray-200 bg-soft p-6"
          >
            <h2 className="text-xl font-extrabold">
              {editing === 'new' ? 'Nouveau produit' : 'Modifier le produit'}
            </h2>

            <label className="block text-sm font-medium">
              Nom en français *
              <input className={inputClass} value={form.name_fr} onChange={(e) => update('name_fr', e.target.value)} />
            </label>
            <label className="block text-sm font-medium">
              Nom en arabe
              <input
                className={inputClass}
                dir="rtl"
                value={form.name_ar}
                onChange={(e) => update('name_ar', e.target.value)}
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm font-medium">
                Prix (DH) *
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  step="1"
                  dir="ltr"
                  value={form.price}
                  onChange={(e) => update('price', e.target.value)}
                />
              </label>
              <label className="block text-sm font-medium">
                Stock *
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  step="1"
                  dir="ltr"
                  value={form.stock}
                  onChange={(e) => update('stock', e.target.value)}
                />
              </label>
            </div>

            <label className="block text-sm font-medium">
              Catégorie
              <select className={inputClass} value={form.category} onChange={(e) => update('category', e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium">
              Description en français
              <textarea
                className={`${inputClass} h-20`}
                value={form.description_fr}
                onChange={(e) => update('description_fr', e.target.value)}
              />
            </label>
            <label className="block text-sm font-medium">
              Description en arabe
              <textarea
                className={`${inputClass} h-20`}
                dir="rtl"
                value={form.description_ar}
                onChange={(e) => update('description_ar', e.target.value)}
              />
            </label>

            <div>
              <p className="text-sm font-medium">Photo</p>
              {form.image_url && (
                <div className="mt-2 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.image_url} alt="" className="h-24 w-24 rounded-xl object-cover" />
                  <button
                    type="button"
                    onClick={() => update('image_url', '')}
                    className="text-sm text-red-400 hover:underline"
                  >
                    Retirer la photo
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadImage(f);
                  e.target.value = '';
                }}
                className="mt-2 block w-full text-sm text-gray-500 file:me-3 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              />
              <p className="mt-1 text-xs text-gray-500">
                {uploading ? 'Envoi de la photo...' : 'JPG, PNG ou WebP, 4 Mo maximum.'}
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => update('active', e.target.checked)}
                className="h-4 w-4 accent-red-600"
              />
              Visible dans la boutique
            </label>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={close}
                className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium hover:bg-black"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving || uploading || !form.name_fr.trim() || form.price === '' || form.stock === ''}
                className="rounded-full bg-brand px-6 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}