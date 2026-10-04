'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { getConsent, setConsent, OPEN_EVENT } from '@/lib/consent';

export default function CookieBanner() {
  const t = useTranslations('Cookies');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (getConsent() === null) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  const choose = (marketing: boolean) => {
    setConsent(marketing);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label={t('title')}
      className="fade-up fixed inset-x-0 bottom-0 z-[60] border-t border-white/10 bg-black/95 p-4 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-gray-300">
          <p className="font-bold text-white">{t('title')}</p>
          <p className="mt-1">
            {t('text')}{' '}
            <Link href="/privacy" className="font-semibold text-brand hover:underline">
              {t('more')}
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => choose(false)}
            className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium hover:bg-white/10"
          >
            {t('refuse')}
          </button>
          <button
            type="button"
            onClick={() => choose(true)}
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
}