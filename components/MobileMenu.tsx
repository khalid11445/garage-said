'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function MobileMenu() {
  const t = useTranslations('Nav');
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/services', label: t('services') },
    { href: '/shop', label: t('shop') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
  ];

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
        aria-expanded={open}
        className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-white/20"
      >
        <span
          className={`h-0.5 w-5 bg-white transition-transform duration-300 ${
            open ? 'translate-y-2 rotate-45' : ''
          }`}
        />
        <span
          className={`h-0.5 w-5 bg-white transition-opacity duration-300 ${
            open ? 'opacity-0' : ''
          }`}
        />
        <span
          className={`h-0.5 w-5 bg-white transition-transform duration-300 ${
            open ? '-translate-y-2 -rotate-45' : ''
          }`}
        />
      </button>

      {open && (
        <nav className="fade-up absolute left-0 right-0 top-full border-b border-white/10 bg-black/95 px-4 py-4 backdrop-blur-md">
          <ul className="flex flex-col">
            {links.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-white/5 py-3 text-lg font-medium text-gray-200 transition hover:text-brand"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}