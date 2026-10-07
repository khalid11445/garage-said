// Limite simple en mémoire (meilleur effort : elle peut se réinitialiser quand le serveur redémarre)
const buckets = new Map<string, { start: number; count: number }>();

export function limited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  if (buckets.size > 5000) buckets.clear();
  const b = buckets.get(key);
  if (!b || now - b.start > windowMs) {
    buckets.set(key, { start: now, count: 1 });
    return false;
  }
  b.count++;
  return b.count > max;
}

export function clientIp(request: Request) {
  return (request.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();
}
