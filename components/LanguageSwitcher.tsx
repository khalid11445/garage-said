'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const other = locale === 'fr' ? 'ar' : 'fr';

  return (
    <button
      onClick={() => router.replace(pathname, { locale: other })}
      className="rounded-full border border-gray-300 px-3 py-1 text-sm font-medium hover:bg-soft"
    >
      {other === 'ar' ? 'العربية' : 'Français'}
    </button>
  );
}