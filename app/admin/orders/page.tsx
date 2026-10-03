import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import OrdersTable, { type Order } from '@/components/admin/OrdersTable';
import LogoutButton from '@/components/admin/LogoutButton';
import AdminNav from '@/components/admin/AdminNav';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  if (!(await isAdmin())) redirect('/admin/login');

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold">
          Garage <span className="text-brand">Said</span>
        </h1>
        <LogoutButton />
      </div>

      <div className="mt-4">
        <AdminNav active="orders" />
      </div>

      {error ? (
        <p className="mt-8 rounded-xl bg-soft p-6 text-red-400">
          Impossible de charger les commandes. Vérifiez la connexion Supabase.
        </p>
      ) : (
        <div className="mt-6">
          <OrdersTable initial={(data ?? []) as Order[]} />
        </div>
      )}
    </main>
  );
}