import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { whatsappLink, PHONE_DISPLAY, WHATSAPP_NUMBER } from '@/lib/config';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildMetadata(locale, 'contact', '/contact');
}
export default function ContactPage() {
  const t = useTranslations();
  const mapUrl =
    'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(t('Contact.mapQuery'));

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-extrabold md:text-4xl">{t('Contact.title')}</h1>
        <p className="mt-3 text-gray-600">{t('Contact.intro')}</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 p-6">
            <p className="text-sm font-semibold text-gray-500">{t('Contact.addressLabel')}</p>
            <p className="mt-1 font-bold">{t('Footer.address')}</p>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-semibold text-brand hover:underline"
            >
              {t('Contact.mapButton')}
            </a>
          </div>

          <div className="rounded-2xl border border-gray-200 p-6">
            <p className="text-sm font-semibold text-gray-500">{t('Contact.hoursLabel')}</p>
            <p className="mt-1 font-bold">{t('Footer.hours')}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 p-6">
            <p className="text-sm font-semibold text-gray-500">{t('Contact.phoneLabel')}</p>
            <a href={`tel:+${WHATSAPP_NUMBER}`} dir="ltr" className="mt-1 block font-bold hover:text-brand">
              {PHONE_DISPLAY}
            </a>
          </div>

          <div className="rounded-2xl border border-gray-200 p-6">
            <p className="text-sm font-semibold text-gray-500">{t('Contact.whatsappLabel')}</p>
            <a
              href={whatsappLink(t('Hero.whatsappMessage'))}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              {t('Hero.whatsapp')}
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}