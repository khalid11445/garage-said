export type Product = {
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
};

export const CATEGORIES = ['oil', 'filters', 'interior', 'electronics'] as const;

export const CATEGORY_ICONS: Record<string, string> = {
  oil: '🛢️',
  filters: '🧰',
  interior: '🪑',
  electronics: '🔌',
};

// Renvoie le texte arabe si on est en arabe et qu'il existe, sinon le français
export const pick = (locale: string, fr: string | null, ar: string | null) =>
  locale === 'ar' && ar ? ar : fr ?? '';