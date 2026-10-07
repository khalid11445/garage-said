'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import CarShowcaseLoader from './CarShowcaseLoader';
import CarPhoto from './CarPhoto';
import {
  ASPECT,
  DRAG_INVERT,
  FRAME_COUNT,
  FRAME_PATH,
  PARTS,
  PART_KEYS,
  SINGLE_PHOTO,
  angleToFrame,
  type PartKey,
} from '@/lib/car360';
import { MODEL_URL } from '@/lib/carParts';

export default function Car360() {
  const t = useTranslations('Car');
  // checking : on cherche / photos : série 360° / model : vrai modèle 3D / single : une photo / fallback : voiture stylisée
  const [mode, setMode] = useState<'checking' | 'photos' | 'model' | 'single' | 'fallback'>('checking');
  const [frame, setFrame] = useState(0);
  const [active, setActive] = useState<PartKey>('home');
  const [zoomed, setZoomed] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [debug, setDebug] = useState(false);
  const [picked, setPicked] = useState('');

  const frameRef = useRef(0);
  const activeRef = useRef<PartKey>('home');
  const goal = useRef<number | null>(null);
  const idleUntil = useRef(0);
  const visible = useRef(true);
  const drag = useRef<{ x: number; frame: number; moved: boolean } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const cache = useRef<HTMLImageElement[]>([]);

  const show = useCallback((f: number) => {
    const n = ((f % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT;
    frameRef.current = n;
    setFrame(n);
  }, []);

  // 1. Que avons-nous ? Série 360°, sinon vrai modèle 3D, sinon une photo, sinon la voiture stylisée
  useEffect(() => {
    setDebug(new URLSearchParams(window.location.search).has('debug'));

    let cancelled = false;
    const set = (m: 'photos' | 'model' | 'single' | 'fallback') => {
      if (!cancelled) setMode(m);
    };

    const probeImage = (src: string, ok: () => void, fail: () => void) => {
      const img = new Image();
      img.onload = ok;
      img.onerror = fail;
      img.src = src;
    };

    const toPhoto = () => probeImage(SINGLE_PHOTO, () => set('single'), () => set('fallback'));

    const toModel = () => {
      fetch(MODEL_URL, { method: 'HEAD' })
        .then((r) => (r.ok ? set('model') : toPhoto()))
        .catch(toPhoto);
    };

    probeImage(FRAME_PATH(0), () => set('photos'), toModel);

    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Chargement de toutes les photos en arrière-plan
  useEffect(() => {
    if (mode !== 'photos') return;
    let count = 0;
    const imgs: HTMLImageElement[] = [];
    const done = () => {
      count++;
      setLoaded(count);
    };
    for (let i = 0; i < FRAME_COUNT; i++) {
      const im = new Image();
      im.onload = done;
      im.onerror = done;
      im.src = FRAME_PATH(i);
      imgs.push(im);
    }
    cache.current = imgs;
    return () => {
      imgs.forEach((im) => {
        im.onload = null;
        im.onerror = null;
      });
    };
  }, [mode]);

  const ready = loaded >= FRAME_COUNT;

  // 3. On ne tourne que lorsque la section est visible
  useEffect(() => {
    if (mode !== 'photos' || !box.current) return;
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting;
    });
    io.observe(box.current);
    return () => io.disconnect();
  }, [mode]);

  // 4. Rotation automatique
  useEffect(() => {
    if (mode !== 'photos' || !ready || debug) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      if (!visible.current || drag.current || goal.current !== null) return;
      if (activeRef.current !== 'home' || Date.now() < idleUntil.current) return;
      show(frameRef.current + 1);
    }, 110);
    return () => clearInterval(id);
  }, [mode, ready, debug, show]);

  // 5. Rotation jusqu'à la zone choisie, puis zoom
  useEffect(() => {
    if (mode !== 'photos') return;
    const id = setInterval(() => {
      const g = goal.current;
      if (g === null) return;
      const cur = frameRef.current;
      if (cur === g) {
        goal.current = null;
        setZoomed(activeRef.current !== 'home');
        return;
      }
      const forward = (((g - cur) % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT;
      show(cur + (forward <= FRAME_COUNT / 2 ? 1 : -1));
    }, 45);
    return () => clearInterval(id);
  }, [mode, show]);

  const select = (k: PartKey) => {
    setActive(k);
    activeRef.current = k;
    setZoomed(false);
    goal.current = k === 'home' ? frameRef.current : angleToFrame(PARTS[k].angle);
    idleUntil.current = Date.now() + 2500;
  };

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ready) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, frame: frameRef.current, moved: false };
    goal.current = null;
  };

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 4 && !d.moved) {
      d.moved = true;
      setZoomed(false);
    }
    const w = box.current?.clientWidth ?? 600;
    const delta = Math.round(dx / (w / FRAME_COUNT));
    show(d.frame + (DRAG_INVERT ? delta : -delta));
  };

  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    idleUntil.current = Date.now() + 2500;
    if (d && !d.moved && debug && box.current) {
      const r = box.current.getBoundingClientRect();
      const x = Math.round(((e.clientX - r.left) / r.width) * 100);
      const y = Math.round(((e.clientY - r.top) / r.height) * 100);
      const angle = Math.round((frameRef.current / FRAME_COUNT) * 360);
      setPicked(`photo ${frameRef.current + 1} · angle: ${angle} · x: ${x} · y: ${y}`);
    }
  };

  const onCancel = () => {
    drag.current = null;
  };

  if (mode === 'checking') return <div className="mx-auto h-[520px] max-w-6xl px-4 py-20" />;
  if (mode === 'model') return <CarShowcaseLoader model />;
  if (mode === 'fallback') return <CarShowcaseLoader />;
  if (mode === 'single') return <CarPhoto />;

  const p = PARTS[active];

  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <h2 className="text-3xl font-extrabold md:text-4xl">{t('title')}</h2>
      <div className="mt-3 h-1 w-16 rounded-full bg-brand" />
      <p className="mt-4 max-w-2xl text-gray-600">{t('subtitle')}</p>

      <div
        ref={box}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onCancel}
        style={{ aspectRatio: ASPECT, touchAction: 'pan-y' }}
        className={`relative mt-8 w-full overflow-hidden ${
          ready ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
      >
        <div
          className="h-full w-full"
          style={{
            transform: zoomed ? `scale(${p.zoom})` : 'scale(1)',
            transformOrigin: `${p.x}% ${p.y}%`,
            transition: 'transform 0.9s cubic-bezier(0.22, 0.8, 0.3, 1)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={FRAME_PATH(frame)}
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

        <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-xs text-gray-300">
          {ready ? t('hint') : `${t('loading')} ${Math.round((loaded / FRAME_COUNT) * 100)}%`}
        </p>

        {debug && (
          <p className="pointer-events-none absolute left-3 top-3 rounded bg-black/80 px-3 py-1 text-xs text-yellow-300">
            photo {frame + 1} · angle {Math.round((frame / FRAME_COUNT) * 360)}°
            {picked ? ` | ${picked}` : ''}
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {PART_KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => select(k)}
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
        <p className="mt-2 text-gray-600">{t(`parts.${active}.text`)}</p>
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
