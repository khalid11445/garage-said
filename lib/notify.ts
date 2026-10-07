import { SITE_URL } from '@/lib/config';

const SERVICES: Record<string, string> = {
  mechanic: 'Mécanique générale',
  bodywork: 'Carrosserie',
  tires: 'Pneus',
  oil: 'Vidange',
  inspection: 'Contrôle technique',
  diagnostic: 'Diagnostic',
};

const SYMPTOMS: Record<string, string> = {
  noise: 'Bruit anormal',
  warning: 'Voyant allumé',
  vibration: 'Vibrations',
  start: 'Démarrage difficile',
  overheat: 'Moteur qui chauffe',
  brakes: 'Freins',
};

// Numéro au format international pour le lien WhatsApp (06... devient 2126...)
function waNumber(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('212')) return digits;
  if (digits.startsWith('0')) return '212' + digits.slice(1);
  return digits;
}

// Envoie un message à toutes les personnes listées dans TELEGRAM_CHAT_ID.
// Ne lève jamais d'erreur : si Telegram est en panne ou mal configuré, le rendez-vous est quand même enregistré.
export async function notifyTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chats = (process.env.TELEGRAM_CHAT_ID ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (!token || chats.length === 0) return; // pas configuré : on ne fait rien

  await Promise.allSettled(
    chats.map(async (chat_id) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      try {
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            chat_id,
            text: text.slice(0, 3900),
            disable_web_page_preview: true,
          }),
          signal: controller.signal,
        });
        if (!res.ok) {
          console.error('Telegram : refus', res.status, (await res.text()).slice(0, 200));
        }
      } catch {
        console.error("Telegram : échec de l'envoi");
      } finally {
        clearTimeout(timer);
      }
    })
  );
}

type BookingInfo = {
  name: string;
  phone: string;
  brand: string;
  model: string;
  plate: string;
  service: string;
  symptoms: string[];
  description: string;
  date: string;
  time: string;
};

export function bookingMessage(b: BookingInfo) {
  const lines = [
    '🔧 Nouveau rendez-vous',
    '',
    `👤 ${b.name}`,
    `📞 ${b.phone}`,
    `🚗 ${b.brand} ${b.model}${b.plate ? ` (${b.plate})` : ''}`,
    `🛠 ${SERVICES[b.service] ?? b.service}`,
    `🗓 ${b.date} à ${b.time}`,
  ];
  if (b.symptoms.length) {
    lines.push(`⚠️ ${b.symptoms.map((s) => SYMPTOMS[s] ?? s).join(', ')}`);
  }
  if (b.description) lines.push(`📝 ${b.description}`);
  lines.push('', `Écrire au client : https://wa.me/${waNumber(b.phone)}`, `Tableau de bord : ${SITE_URL}/admin`);
  return lines.join('\n');
}

type OrderInfo = {
  ref: string;
  name: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
  items: { name: string; price: number; qty: number }[];
  total: number;
};

export function orderMessage(o: OrderInfo) {
  const lines = [
    `🛒 Nouvelle commande #${o.ref}`,
    '',
    `👤 ${o.name}`,
    `📞 ${o.phone}`,
    `📍 ${o.city}, ${o.address}`,
    '',
    ...o.items.map((i) => `• ${i.qty} × ${i.name} — ${i.qty * i.price} DH`),
    `💰 Total : ${o.total} DH (paiement en espèces à la livraison)`,
  ];
  if (o.notes) lines.push(`📝 ${o.notes}`);
  lines.push('', `Écrire au client : https://wa.me/${waNumber(o.phone)}`, `Tableau de bord : ${SITE_URL}/admin/orders`);
  return lines.join('\n');
}
