import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import BookingsTable, { type Booking } from '@/components/admin/BookingsTable';
import LogoutButton from '@/components/admin/LogoutButton';
import AdminNav from '@/components/admin/AdminNav';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!(await isAdmin())) redirect('/admin/login');

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('bookings')
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
        <AdminNav active="bookings" />
      </div>

      {error ? (
        <p className="mt-8 rounded-xl bg-soft p-6 text-red-400">
          Impossible de charger les rendez-vous. Vérifiez la connexion Supabase.
        </p>
      ) : (
        <div className="mt-6">
          <BookingsTable initial={(data ?? []) as Booking[]} />
        </div>
      )}
    </main>
  );
}