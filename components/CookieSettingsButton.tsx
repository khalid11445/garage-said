'use client';

import { OPEN_EVENT } from '@/lib/consent';

export default function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      className="transition hover:text-white"
    >
      {label}
    </button>
  );
}