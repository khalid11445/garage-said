'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useCart } from '@/lib/cart';

type P = { id: string; slug: string; name_fr: string; name_ar: string | null; price: number };

export default function AddToCartButton({ product, disabled }: { product: P; disabled?: boolean }) {
  const t = useTranslations('Shop');
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const onClick = () => {
    add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="btn-glow rounded-full bg-brand px-8 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        {added ? t('added') : t('addToCart')}
      </button>
      {added && (
        <Link href="/cart" className="text-sm font-semibold text-brand hover:underline">
          {t('viewCart')}
        </Link>
      )}
    </div>
  );
}