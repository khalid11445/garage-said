import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SITE_URL, WHATSAPP_NUMBER } from '@/lib/config';

export async function buildMetadata(locale: string, page: string, path: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Meta' });
  const title = t(`${page}.title`);
  const description = t(`${page}.description`);
  const url = `${SITE_URL}/${locale}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        fr: `${SITE_URL}/fr${path}`,
        ar: `${SITE_URL}/ar${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Garage Said',
      locale: locale === 'ar' ? 'ar_MA' : 'fr_MA',
      type: 'website',
    },
  };
}

// Données lues par Google pour la fiche de l'entreprise
export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: 'Garage Said',
    url: SITE_URL,
    telephone: `+${WHATSAPP_NUMBER}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Aïn Leuh',
      addressRegion: 'Fès-Meknès',
      addressCountry: 'MA',
    },
    areaServed: 'Aïn Leuh',
    availableLanguage: ['fr', 'ar'],
  };
}