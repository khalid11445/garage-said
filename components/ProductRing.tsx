'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CATEGORY_ICONS, pick } from '@/lib/products';

export type RingProduct = {
  id: string;
  slug: string;
  name_fr: string;
  name_ar: string | null;
  price: number;
  category: string;
  image_url: string | null;
};

const MIN_CARDS = 8;
const GAP = 28;
const AUTO_SPEED = -16; // degrés par seconde

export default function ProductRing({ products }: { products: RingProduct[] }) {
  const t = useTranslations('Shop');
  const ts = useTranslations('Showcase');
  const locale = useLocale();

  // Peu de produits : on les répète pour remplir le cercle
  const items = useMemo(() => {
    if (products.length === 0) return [];
    const list: RingProduct[] = [];
    while (list.length < MIN_CARDS) list.push(...products);
    return list;
  }, [products]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rot = useRef(0);
  const vel = useRef(AUTO_SPEED);
  const dragging = useRef(false);
  const moved = useRef(false);
  const hover = useRef(false);
  const visible = useRef(true);

  const [cardW, setCardW] = useState(210);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setCardW(el.clientWidth < 640 ? 150 : 210);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = items.length;
  const step = n > 0 ? 360 / n : 0;
  const radius = n > 0 ? Math.round((cardW + GAP) / 2 / Math.tan(Math.PI / n)) : 0;
  const cardH = Math.round(cardW * 1.3);

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring || n === 0) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const apply = () => {
      ring.style.transform = `translateZ(${-radius}px) rotateY(${rot.current}deg)`;
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        const a = ((rot.current + i * step) * Math.PI) / 180;
        const facing = (1 + Math.cos(a)) / 2;
        el.style.opacity = String(0.25 + 0.75 * facing);
        el.style.pointerEvents = facing > 0.6 ? 'auto' : 'none';
      });
    };

    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting;
    });
    if (wrapRef.current) io.observe(wrapRef.current);

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible.current) return;
      if (!dragging.current) {
        const target = reduce || hover.current ? 0 : AUTO_SPEED;
        vel.current += (target - vel.current) * Math.min(1, dt * 2.5);
        rot.current += vel.current * dt;
      }
      rot.current %= 360;
      apply();
    };

    apply();
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [radius, step, n]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging.current = true;
    moved.current = false;
    const startX = e.clientX;
    let lastX = e.clientX;
    let lastT = performance.now();

    const move = (ev: PointerEvent) => {
      const now = performance.now();
      const dx = ev.clientX - lastX;
      if (Math.abs(ev.clientX - startX) > 6) moved.current = true;
      const deg = dx * 0.4;
      rot.current += deg;
      const dt = Math.max(0.008, (now - lastT) / 1000);
      vel.current = Math.max(-220, Math.min(220, deg / dt));
      lastX = ev.clientX;
      lastT = now;
    };
    const up = () => {
      dragging.current = false;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  if (n === 0) return null;

  return (
    <div
      ref={wrapRef}
      onPointerDown={onPointerDown}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') hover.current = true;
      }}
      onPointerLeave={() => {
        hover.current = false;
      }}
      className="relative mx-auto mt-8 w-full cursor-grab select-none overflow-hidden active:cursor-grabbing"
      style={{
        perspective: '1200px',
        height: cardH + 50,
        touchAction: 'pan-y',
        maskImage: 'linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)',
      }}
    >
      <div
        ref={ringRef}
        className="relative mx-auto"
        style={{ width: '100%', height: cardH, marginTop: 25, transformStyle: 'preserve-3d' }}
      >
        {items.map((p, i) => {
          const name = pick(locale, p.name_fr, p.name_ar);
          return (
            <div
              key={`${p.id}-${i}`}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: `calc(50% - ${cardW / 2}px)`,
                width: cardW,
                height: cardH,
                transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
                backfaceVisibility: 'hidden',
              }}
            >
              <Link
                href={`/shop/${p.slug}`}
                draggable={false}
                onClick={(e) => {
                  if (moved.current) e.preventDefault();
                }}
                className="card-glow block h-full overflow-hidden rounded-2xl border border-gray-200 bg-soft"
              >
                <div
                  className="flex items-center justify-center bg-black/40"
                  style={{ height: Math.round(cardH * 0.68) }}
                >
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image_url}
                      alt={name}
                      draggable={false}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl">{CATEGORY_ICONS[p.category] ?? '🔧'}</span>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-bold">{name}</p>
                  <p className="mt-1 font-extrabold text-brand">
                    {Number(p.price)} {t('currency')}
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      <p className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-xs text-gray-300">
        {ts('hint')}
      </p>
    </div>
  );
}