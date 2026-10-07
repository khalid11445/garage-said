'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ASPECT, PART_KEYS, PHOTO_PARTS, SINGLE_PHOTO, type PartKey } from '@/lib/car360';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function CarPhoto() {
  const t = useTranslations('Car');
  const box = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<PartKey>('home');
  const [shift, setShift] = useState({ x: 0, y: 0 });
  const [debug, setDebug] = useState(false);
  const [picked, setPicked] = useState('');

  useEffect(() => {
    setDebug(new URLSearchParams(window.location.search).has('debug'));
  }, []);

  const isHome = active === 'home';
  const part = PHOTO_PARTS[active];
  const scale = isHome ? 1.03 : part.zoom;
  const half = 50 / scale;
  const cx = isHome ? 50 : clamp(part.x, half, 100 - half);
  const cy = isHome ? 50 : clamp(part.y, half, 100 - half);
  const tx = 50 - scale * cx + (isHome ? shift.x : 0);
  const ty = 50 - scale * cy + (isHome ? shift.y : 0);

  // Léger effet de profondeur quand la souris bouge sur la vue d'ensemble
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !box.current) return;
    const r = box.current.getBoundingClientRect();
    setShift({
      x: -((e.clientX - r.left) / r.width - 0.5) * 2.4,
      y: -((e.clientY - r.top) / r.height - 0.5) * 2.4,
    });
  };

  // Mode ?debug : cliquez sur la photo (en vue d'ensemble) pour lire x et y
  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!debug || !isHome || !box.current) return;
    const r = box.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - r.left) / r.width) * 100);
    const y = Math.round(((e.clientY - r.top) / r.height) * 100);
    setPicked(`x: ${x} · y: ${y}`);
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <h2 className="text-3xl font-extrabold md:text-4xl">{t('title')}</h2>
      <div className="mt-3 h-1 w-16 rounded-full bg-brand" />
      <p className="mt-4 max-w-2xl text-gray-600">{t('photoSubtitle')}</p>

      <div
        ref={box}
        onPointerMove={onMove}
        onPointerLeave={() => setShift({ x: 0, y: 0 })}
        onClick={onClick}
        style={{ aspectRatio: ASPECT }}
        className="relative mt-8 w-full overflow-hidden"
      >
        <div
          className="h-full w-full"
          style={{
            transform: `translate(${tx}%, ${ty}%) scale(${scale})`,
            transformOrigin: '0 0',
            transition: 'transform 0.9s cubic-bezier(0.22, 0.8, 0.3, 1)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SINGLE_PHOTO}
            alt={t('title')}
            draggable={false}
            className="h-full w-full select-none object-cover"
          />
        </div>

        {/* Fondu des bords dans le noir de la page */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: 'inset 0 0 70px 35px #050505' }}
        />

        {isHome && (
          <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-xs text-gray-300">
            {t('photoHint')}
          </p>
        )}

        {debug && (
          <p className="pointer-events-none absolute left-3 top-3 rounded bg-black/80 px-3 py-1 text-xs text-yellow-300">
            {isHome ? picked || 'cliquez sur la photo' : 'revenez à la vue d\u2019ensemble pour mesurer'}
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {PART_KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setActive(k)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              active === k ? 'border-brand bg-brand text-white' : 'border-gray-300 hover:bg-soft'
            }`}
          >
            {t(`parts.${k}.label`)}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-gray-200 bg-soft p-6">
        <h3 className="text-xl font-bold">{t(`parts.${active}.title`)}</h3>
        <p className="mt-2 text-gray-600">{isHome ? t('photoHome') : t(`parts.${active}.text`)}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/booking"
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            {t('cta')}
          </Link>
          <Link
            href="/services"
            className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium transition hover:bg-black"
          >
            {t('more')}
          </Link>
        </div>
      </div>
    </section>
  );
}
