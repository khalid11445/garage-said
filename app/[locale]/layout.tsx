import type { Metadata } from 'next';
import { Inter, Cairo } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { CartProvider } from '@/lib/cart';
import WhatsAppButton from '@/components/WhatsAppButton';
import '../globals.css';
import { SITE_URL } from '@/lib/config';
import CookieBanner from '@/components/CookieBanner';
import ChatWidget from '@/components/ChatWidget';
const inter = Inter({ subsets: ['latin'] });
const cairo = Cairo({ subsets: ['arabic', 'latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Garage Said - Aïn Leuh',
  description: 'Mécanique, carrosserie, pneus, vidange et diagnostic à Aïn Leuh',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const isAr = locale === 'ar';

  return (
    <html lang={locale} dir={isAr ? 'rtl' : 'ltr'}>
      <body className={isAr ? cairo.className : inter.className}>
        <NextIntlClientProvider>
          <CartProvider>
            {children}
            <WhatsAppButton />
            <CookieBanner />
            <ChatWidget />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}