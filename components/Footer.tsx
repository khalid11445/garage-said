import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { PHONE_DISPLAY, SOCIAL } from '@/lib/config';
import CookieSettingsButton from './CookieSettingsButton';

function SocialIcon({ name }: { name: 'facebook' | 'instagram' | 'youtube' }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  if (name === 'facebook') {
    return (
      <svg {...common}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    );
  }
  if (name === 'instagram') {
    return (
      <svg {...common}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}

const socials = [
  { name: 'facebook', label: 'Facebook', url: SOCIAL.facebook },
  { name: 'instagram', label: 'Instagram', url: SOCIAL.instagram },
  { name: 'youtube', label: 'YouTube', url: SOCIAL.youtube },
] as const;

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-gray-400 sm:grid-cols-3">
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
          <Link href="/shop" className="transition hover:text-white">{t('Nav.shop')}</Link>
          <Link href="/about" className="transition hover:text-white">{t('Nav.about')}</Link>
          <Link href="/contact" className="transition hover:text-white">{t('Nav.contact')}</Link>
          <Link href="/booking" className="transition hover:text-white">{t('Nav.book')}</Link>
        </div>

        <div>
          <p className="font-bold text-white">{t('Footer.follow')}</p>
          <div className="mt-3 flex gap-3">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-gray-300 transition hover:border-brand hover:bg-brand hover:text-white"
              >
                <SocialIcon name={s.name} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-gray-500">
          <p>
            © {new Date().getFullYear()} Garage Said. {t('Footer.rights')}
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="transition hover:text-white">{t('Footer.privacy')}</Link>
            <CookieSettingsButton label={t('Footer.cookies')} />
          </div>
        </div>
      </div>
    </footer>
  );
}