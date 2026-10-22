// Public embed readiness only; no bot token or login credentials are sent here.
const readiness = new Map<string, { ready: boolean; expires: number }>();
const PRODUCTION_ORIGINS = new Set(['https://robota-smila.com.ua', 'https://www.robota-smila.com.ua']);

export async function telegramDomainReady(username: string, origin: string): Promise<boolean> {
  if (!PRODUCTION_ORIGINS.has(origin) || !/^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(username)) return false;
  const key = `${origin}/${username}`;
  const cached = readiness.get(key);
  if (cached && cached.expires > Date.now()) return cached.ready;
  let ready = false;
  try {
    const url = new URL(`https://oauth.telegram.org/embed/${username}`);
    url.searchParams.set('origin', origin);
    const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    const html = await response.text();
    ready = response.ok && html.trim().length > 0 && !/bot\s+domain\s+invalid/i.test(html);
  } catch {
    // Fail closed on transport errors; the widget would fail for the visitor too.
  }
  readiness.set(key, { ready, expires: Date.now() + 300000 });
  return ready;
}
