import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import { whatsappLink } from '@/lib/config';
import { buildMetadata } from '@/lib/seo';
import Car360 from '@/components/Car360';
import FeaturedProducts from '@/components/FeaturedProducts';
export const dynamic = 'force-dynamic';
import CarGallery from '@/components/CarGallery';
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
  return buildMetadata(locale, 'home', '');
}

export default function HomePage() {
  const t = useTranslations();

  return (
    <>
      <Header />

      <main>
        {/* Section d'accueil */}
        <section className="relative overflow-hidden bg-black">
          <div className="blob blob-a" />
          <div className="blob blob-b" />
          <div className="grid-bg absolute inset-0" />

          <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-36">
            <span className="fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-semibold">
              <span className="pulse-dot" />
              {t('Hero.badge')}
            </span>

            <h1
              className="fade-up text-gradient mt-6 max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl"
              style={{ animationDelay: '150ms' }}
            >
              {t('Hero.title')}
            </h1>

            <p
              className="fade-up mt-6 max-w-xl text-lg text-gray-400"
              style={{ animationDelay: '300ms' }}
            >
              {t('Hero.subtitle')}
            </p>

            <div
              className="fade-up mt-10 flex flex-wrap gap-4"
              style={{ animationDelay: '450ms' }}
            >
              <Link
                href="/booking"
                className="btn-glow rounded-full bg-brand px-7 py-3 font-semibold text-white transition hover:bg-brand-dark"
              >
                {t('Hero.cta')}
              </Link>
              <a
                href={whatsappLink(t('Hero.whatsappMessage'))}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/30 px-7 py-3 font-semibold transition hover:bg-white/10"
              >
                {t('Hero.whatsapp')}
              </a>
            </div>
          </div>
        </section>
        {/* Car Showcase */}
         <Car360 />
         {/* Produits en vedette */}
         <CarGallery
  title={t('Gallery.title')}
  items={[
    { src: '/car/details/moteur.png', label: t('Gallery.engine') },
    { src: '/car/details/pneu.png', label: t('Gallery.tires') },
    { src: '/car/details/phare.png', label: t('Gallery.body') },
    { src: '/car/details/interieure.png', label: t('Gallery.interior') },
    { src: '/car/details/arriere.png', label: t('Gallery.rear') },
  ]}
/>
         <FeaturedProducts />

        {/* Services */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <Reveal>
            <h2 className="text-3xl font-extrabold md:text-4xl">{t('Services.title')}</h2>
            <div className="mt-3 h-1 w-16 rounded-full bg-brand" />
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <Reveal key={s.key} delay={i * 100}>
                <div className="card-glow h-full rounded-2xl border border-gray-200 bg-soft p-6">
                  <div className="card-icon text-4xl">{s.icon}</div>
                  <h3 className="mt-4 text-xl font-bold">{t(`Services.${s.key}.name`)}</h3>
                  <p className="mt-2 text-gray-600">{t(`Services.${s.key}.desc`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Appel à l'action */}
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <Reveal>
            <div className="cta-band rounded-3xl p-10 text-center md:p-14">
              <h2 className="mx-auto max-w-2xl text-2xl font-extrabold md:text-3xl">
                {t('ServicesPage.ctaText')}
              </h2>
              <Link
                href="/booking"
                className="btn-glow mt-6 inline-block rounded-full bg-brand px-8 py-3 font-semibold text-white transition hover:bg-brand-dark"
              >
                {t('Hero.cta')}
              </Link>
            </div>
          </Reveal>
        </section>
       
        {/* Services */}
      </main>

      <Footer />
    </>
  );
}


