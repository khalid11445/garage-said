import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import MobileMenu from './MobileMenu';
import CartLink from './CartLink';

export default function Header() {
  const t = useTranslations('Nav');

  return (
    <header className="slide-down sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-xl font-extrabold text-white">
          Garage <span className="text-brand">Said</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-gray-400 md:flex">
          <Link href="/services" className="transition hover:text-white">{t('services')}</Link>
          <Link href="/shop" className="transition hover:text-white">{t('shop')}</Link>
          <Link href="/about" className="transition hover:text-white">{t('about')}</Link>
          <Link href="/contact" className="transition hover:text-white">{t('contact')}</Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <CartLink />
          <Link
            href="/booking"
            className="rounded-full bg-brand px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-dark sm:px-4 sm:text-sm"
          >
            {t('book')}
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}