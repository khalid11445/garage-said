import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import BookingForm from '@/components/BookingForm';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildMetadata(locale, 'booking', '/booking');
}
export default function BookingPage() {
  const t = useTranslations('Booking');
  

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-3xl font-extrabold">{t('title')}</h1>
        <BookingForm />
      </main>
    </>
  );
}