import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import BookingForm from '@/components/BookingForm';

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