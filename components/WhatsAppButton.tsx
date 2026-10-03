import { useTranslations } from 'next-intl';
import { whatsappLink } from '@/lib/config';

export default function WhatsAppButton() {
  const t = useTranslations('Hero');

  return (
    <a
      href={whatsappLink(t('whatsappMessage'))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-5 end-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-2xl shadow-lg shadow-green-500/30 transition hover:scale-110"
    >
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-30" />
      <span className="relative">💬</span>
    </a>
  );
}