import Link from 'next/link';

export default function AdminNav({ active }: { active: 'bookings' | 'orders' | 'products' }) {
  const tab = (isActive: boolean) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${
      isActive ? 'bg-brand text-white' : 'border border-gray-300 hover:bg-soft'
    }`;

  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/admin" className={tab(active === 'bookings')}>
        Rendez-vous
      </Link>
      <Link href="/admin/orders" className={tab(active === 'orders')}>
        Commandes
      </Link>
      <Link href="/admin/products" className={tab(active === 'products')}>
        Produits
      </Link>
    </div>
  );
}