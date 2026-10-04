import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { buildMetadata } from '@/lib/seo';

const values = ['quality', 'transparency', 'speed'] as const;
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildMetadata(locale, 'about', '/about');
}

export default function AboutPage() {
  const t = useTranslations('About');


  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-extrabold md:text-4xl">{t('title')}</h1>
        <p className="mt-4 text-lg text-gray-700">{t('intro')}</p>
        <p className="mt-4 text-gray-700">{t('p1')}</p>
        <p className="mt-4 text-gray-700">{t('p2')}</p>

        <h2 className="mt-12 text-2xl font-extrabold">{t('valuesTitle')}</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {values.map((v) => (
            <div key={v} className="rounded-2xl bg-soft p-6">
              <h3 className="text-lg font-bold text-brand">{t(`values.${v}.title`)}</h3>
              <p className="mt-2 text-sm text-gray-700">{t(`values.${v}.desc`)}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/booking"
            className="inline-block rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
          >
            {t('cta')}
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}