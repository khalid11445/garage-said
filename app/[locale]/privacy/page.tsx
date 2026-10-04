import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Privacy' });
  return { title: `${t('title')} | Garage Said` };
}

export default function PrivacyPage() {
  const t = useTranslations('Privacy');
  const sections = t.raw('sections') as { title: string; text: string }[];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-extrabold md:text-4xl">{t('title')}</h1>
        <p className="mt-4 text-gray-700">{t('intro')}</p>

        <div className="mt-8 space-y-6">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-xl font-bold text-brand">{s.title}</h2>
              <p className="mt-2 leading-relaxed text-gray-700">{s.text}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}