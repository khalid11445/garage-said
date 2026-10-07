import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getSupabaseAdmin } from '@/lib/supabase';
import ProductRing, { type RingProduct } from './ProductRing';

export default async function FeaturedProducts() {
  let products: RingProduct[] = [];

  try {
    const { data } = await getSupabaseAdmin()
      .from('products')
      .select('id, slug, name_fr, name_ar, price, category, image_url')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(12);
    products = (data ?? []) as RingProduct[];
  } catch {
    // Si la base est indisponible, la section n'apparaît simplement pas
  }

  if (products.length === 0) return null;

  // Les produits avec photo passent en premier
  products.sort((a, b) => Number(!!b.image_url) - Number(!!a.image_url));

  const t = await getTranslations('Showcase');

  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <h2 className="text-3xl font-extrabold md:text-4xl">{t('title')}</h2>
      <div className="mt-3 h-1 w-16 rounded-full bg-brand" />
      <p className="mt-4 max-w-2xl text-gray-600">{t('subtitle')}</p>

      <ProductRing products={products} />

      <div className="mt-8 text-center">
        <Link
          href="/shop"
          className="btn-glow inline-block rounded-full bg-brand px-8 py-3 font-semibold text-white transition hover:bg-brand-dark"
        >
          {t('cta')}
        </Link>
      </div>
    </section>
  );
}