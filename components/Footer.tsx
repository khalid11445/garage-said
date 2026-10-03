import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { PHONE_DISPLAY } from '@/lib/config';

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-gray-400 sm:grid-cols-2">
        <div>
          <p className="text-lg font-bold text-white">
            Garage <span className="text-brand">Said</span>
          </p>
          <p className="mt-2">{t('Footer.address')}</p>
          <p className="mt-1">{t('Footer.hours')}</p>
          <p className="mt-1" dir="ltr">{PHONE_DISPLAY}</p>
        </div>
        <div className="flex flex-col gap-1">
          <Link href="/services" className="transition hover:text-white">{t('Nav.services')}</Link>
          <Link href="/about" className="transition hover:text-white">{t('Nav.about')}</Link>
          <Link href="/contact" className="transition hover:text-white">{t('Nav.contact')}</Link>
          <Link href="/booking" className="transition hover:text-white">{t('Nav.book')}</Link>
        </div>
      </div>
    </footer>
  );
}