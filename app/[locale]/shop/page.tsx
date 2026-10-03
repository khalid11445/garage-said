import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { getSupabaseAdmin } from '@/lib/supabase';
import { CATEGORIES, type Product } from '@/lib/products';
import { buildMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildMetadata(locale, 'shop', '/shop');
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const t = await getTranslations('Shop');

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });

  const validCat = CATEGORIES.find((c) => c === cat);
  if (validCat) query = query.eq('category', validCat);

  const { data } = await query;
  const products = (data ?? []) as Product[];

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm font-medium transition ${
      active ? 'border-brand bg-brand text-white' : 'border-gray-300 hover:bg-soft'
    }`;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-extrabold md:text-4xl">{t('title')}</h1>
        <p className="mt-3 max-w-2xl text-gray-600">{t('intro')}</p>

        <div className="mt-8 flex flex-wrap gap-2">
          <Link href="/shop" className={chip(!validCat)}>
            {t('all')}
          </Link>
          {CATEGORIES.map((c) => (
            <Link key={c} href={`/shop?cat=${c}`} className={chip(validCat === c)}>
              {t(`categories.${c}`)}
            </Link>
          ))}
        </div>

        {products.length === 0 ? (
          <p className="mt-10 rounded-xl bg-soft p-6 text-center text-gray-500">{t('noProducts')}</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}