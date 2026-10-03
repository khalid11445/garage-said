import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CATEGORY_ICONS, pick, type Product } from '@/lib/products';

export default function ProductCard({ product }: { product: Product }) {
  const t = useTranslations('Shop');
  const locale = useLocale();
  const name = pick(locale, product.name_fr, product.name_ar);
  const inStock = product.stock > 0;

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="card-glow block h-full overflow-hidden rounded-2xl border border-gray-200 bg-soft"
    >
      <div className="flex h-44 items-center justify-center bg-black/40 text-6xl">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="card-icon">{CATEGORY_ICONS[product.category] ?? '🔧'}</span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-bold">{name}</h3>
        <p className="mt-2 text-lg font-extrabold text-brand">
          {Number(product.price)} {t('currency')}
        </p>
        <p className={`mt-1 text-xs ${inStock ? 'text-green-400' : 'text-gray-500'}`}>
          {inStock ? t('inStock') : t('outOfStock')}
        </p>
      </div>
    </Link>
  );
}