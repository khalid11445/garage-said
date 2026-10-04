'use client';

import dynamic from 'next/dynamic';

const CarShowcase = dynamic(() => import('./CarShowcase'), {
  ssr: false,
  loading: () => <div className="mx-auto h-[520px] max-w-6xl px-4 py-20" />,
});

export default CarShowcase;