import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSupabaseAdmin } from '@/lib/supabase';
import { CATEGORY_ICONS, pick, type Product } from '@/lib/products';
import { whatsappLink } from '@/lib/config';
import AddToCartButton from '@/components/AddToCartButton';

export const dynamic = 'force-dynamic';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations('Shop');

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle();

  if (!data) notFound();

  const p = data as Product;
  const name = pick(locale, p.name_fr, p.name_ar);
  const description = pick(locale, p.description_fr, p.description_ar);
  const inStock = p.stock > 0;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Link href="/shop" className="text-sm text-gray-500 transition hover:text-white">
          {t('back')}
        </Link>

        <div className="mt-6 grid gap-10 md:grid-cols-2">
          <div className="flex h-80 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-soft text-8xl">
            {p.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image_url} alt={name} className="h-full w-full object-cover" />
            ) : (
              <span>{CATEGORY_ICONS[p.category] ?? '🔧'}</span>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-brand">{t(`categories.${p.category}`)}</p>
            <h1 className="mt-1 text-3xl font-extrabold">{name}</h1>
            <p className="mt-4 text-3xl font-extrabold text-brand">
              {Number(p.price)} {t('currency')}
            </p>
            <p className={`mt-2 text-sm ${inStock ? 'text-green-400' : 'text-gray-500'}`}>
              {inStock ? t('inStock') : t('outOfStock')}
            </p>

            {description && <p className="mt-6 leading-relaxed text-gray-700">{description}</p>}

            <ul className="mt-6 space-y-2 text-sm text-gray-600">
              <li>🚚 {t('deliveryNote')}</li>
              <li>💵 {t('cashNote')}</li>
            </ul>

                       <div className="mt-8 flex flex-wrap items-center gap-3">
              <AddToCartButton
                product={{
                  id: p.id,
                  slug: p.slug,
                  name_fr: p.name_fr,
                  name_ar: p.name_ar,
                  price: Number(p.price),
                }}
                disabled={!inStock}
              />
              <a
                href={whatsappLink(t('whatsappMessage', { name }))}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/30 px-6 py-3 font-semibold transition hover:bg-white/10"
              >
                {t('orderWhatsapp')}
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}