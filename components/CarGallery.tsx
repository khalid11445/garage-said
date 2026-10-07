'use client';

import Image from 'next/image';
import { useState } from 'react';

type Item = { src: string; label: string };

export default function CarGallery({ title, items }: { title: string; items: Item[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <h2 className="text-3xl font-extrabold md:text-4xl">{title}</h2>
      <div className="mt-3 h-1 w-16 rounded-full bg-brand" />

      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map((item, i) => (
          <button
            key={item.src}
            onClick={() => setOpen(i)}
            className="group relative aspect-video overflow-hidden rounded-xl"
            aria-label={item.label}
          >
            <Image
              src={item.src}
              alt={item.label}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <span className="absolute bottom-2 start-2 rounded bg-black/60 px-2 py-1 text-sm text-white">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setOpen(null)}
        >
          <div className="relative h-[80vh] w-full max-w-5xl">
            <Image
              src={items[open].src}
              alt={items[open].label}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}