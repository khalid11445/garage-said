export const CONSENT_KEY = 'garage-said-consent';
export const CONSENT_EVENT = 'garage-said-consent-change';
export const OPEN_EVENT = 'garage-said-open-cookies';

export type Consent = { marketing: boolean; date: string };

export function getConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed?.marketing === 'boolean' ? parsed : null;
  } catch {
    return null;
  }
}

export function setConsent(marketing: boolean) {
  try {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ marketing, date: new Date().toISOString() })
    );
  } catch {}
  window.dispatchEvent(new Event(CONSENT_EVENT));
}