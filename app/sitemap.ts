import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/config';
import { routing } from '@/i18n/routing';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ['', '/services', '/about', '/contact', '/booking', '/shop'];
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const p of pages) {
      entries.push({
        url: `${SITE_URL}/${locale}${p}`,
        lastModified: new Date(),
        changeFrequency: p === '' || p === '/shop' ? 'weekly' : 'monthly',
        priority: p === '' ? 1 : 0.8,
      });
    }
  }

  try {
    const { data } = await getSupabaseAdmin()
      .from('products')
      .select('slug, created_at')
      .eq('active', true);

    for (const product of data ?? []) {
      for (const locale of routing.locales) {
        entries.push({
          url: `${SITE_URL}/${locale}/shop/${product.slug}`,
          lastModified: new Date(product.created_at),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    }
  } catch {
    // Si la base est indisponible, on publie quand même les pages principales
  }

  return entries;
}