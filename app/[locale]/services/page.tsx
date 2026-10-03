import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { buildMetadata } from '@/lib/seo';

const services = [
  { key: 'mechanic', icon: '🔧' },
  { key: 'bodywork', icon: '🚗' },
  { key: 'tires', icon: '🛞' },
  { key: 'oil', icon: '🛢️' },
  { key: 'inspection', icon: '✅' },
  { key: 'diagnostic', icon: '💻' },
] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildMetadata(locale, 'services', '/services');
}
export default function ServicesPage() {
  const t = useTranslations();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-extrabold md:text-4xl">{t('Services.title')}</h1>
        <p className="mt-3 max-w-2xl text-gray-600">{t('ServicesPage.intro')}</p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {services.map((s) => (
            <section key={s.key} className="rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="text-4xl">{s.icon}</div>
              <h2 className="mt-4 text-xl font-bold">{t(`Services.${s.key}.name`)}</h2>
              <p className="mt-2 text-gray-600">{t(`Services.${s.key}.desc`)}</p>
              <ul className="mt-4 list-disc space-y-1 ps-5 text-sm text-gray-700">
                {(t.raw(`ServicesPage.items.${s.key}`) as string[]).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-ink p-8 text-center text-white">
          <p className="text-xl font-bold">{t('ServicesPage.ctaText')}</p>
          <Link
            href="/booking"
            className="mt-5 inline-block rounded-full bg-brand px-6 py-3 font-semibold hover:bg-brand-dark"
          >
            {t('Hero.cta')}
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}