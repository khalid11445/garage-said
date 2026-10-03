import { CATEGORIES } from '@/lib/products';

const clip = (v: unknown, max: number) =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

export function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'produit'
  );
}

export function parseProduct(data: Record<string, unknown>) {
  const name_fr = clip(data.name_fr, 150);
  if (!name_fr) return { error: 'Le nom en français est obligatoire' };

  const price = Number(data.price);
  if (!Number.isFinite(price) || price < 0 || price > 1000000) {
    return { error: 'Prix invalide' };
  }

  const stock = Number(data.stock);
  if (!Number.isInteger(stock) || stock < 0 || stock > 100000) {
    return { error: 'Stock invalide (nombre entier, 0 ou plus)' };
  }

  const category = clip(data.category, 30);
  if (!(CATEGORIES as readonly string[]).includes(category)) {
    return { error: 'Catégorie invalide' };
  }

  const image_url = clip(data.image_url, 500);
  if (image_url && !image_url.startsWith('https://')) {
    return { error: "L'adresse de l'image doit commencer par https://" };
  }

  return {
    value: {
      name_fr,
      name_ar: clip(data.name_ar, 150) || null,
      description_fr: clip(data.description_fr, 2000) || null,
      description_ar: clip(data.description_ar, 2000) || null,
      price,
      stock,
      category,
      image_url: image_url || null,
      active: data.active !== false,
    },
  };
}