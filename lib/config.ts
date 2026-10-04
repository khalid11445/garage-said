// Remplacez par le vrai numéro du garage (format international, sans + ni espaces)
export const WHATSAPP_NUMBER = '+212719807467';
export const PHONE_DISPLAY = '+212 7 19 80 74 67';

export const whatsappLink = (text: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
// Adresse publique du site (à définir au moment de la mise en ligne)
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
// Remplacez par les vraies pages du garage
export const SOCIAL = {
  facebook: 'https://www.facebook.com/',
  instagram: 'https://www.instagram.com/',
  youtube: 'https://www.youtube.com/',
};