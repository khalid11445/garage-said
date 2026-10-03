'use client';

import { Link } from '@/i18n/navigation';
import { useCart } from '@/lib/cart';

export default function CartLink() {
  const { count, ready } = useCart();

  return (
    <Link
      href="/cart"
      aria-label="Panier"
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-lg transition hover:bg-white/10"
    >
      🛒
      {ready && count > 0 && (
        <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}