import telegramSourcePages from "./telegram-source-pages.json";
/** Public navigation destinations only; never accept a redirect URL from a request. */
export const OUTBOUND_DESTINATIONS = {
  "telegram-channel": "https://t.me/robota_smila_ua",
  "telegram-admin": "https://t.me/Smila_admin",
  tiktok: "https://www.tiktok.com/@robota_smila",
  youtube: "https://www.youtube.com/@Robota-smila",
  "google-privacy": "https://policies.google.com/privacy",
  "google-review": "https://search.google.com/local/writereview?placeid=ChIJiU080ehB0UARKN0Knb2MH4A",
} as const;

export const OUTBOUND_REL = "nofollow noopener noreferrer";

export function getVacancySourceHref(id: number): string {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Invalid vacancy identifier");
  return `/go/source-${id}`;
}

export function getOutboundDestination(id: string): string | undefined {
  if (Object.hasOwn(OUTBOUND_DESTINATIONS, id)) {
    return OUTBOUND_DESTINATIONS[id as keyof typeof OUTBOUND_DESTINATIONS];
  }
  // Post identifiers can only construct a URL on our own public Telegram channel.
  const post = /^telegram-post-([1-9]\d{0,14})$/.exec(id);
  return post ? `${OUTBOUND_DESTINATIONS["telegram-channel"]}/${post[1]}` : undefined;
}

export const TELEGRAM_PROJECT = "robota-smila";

/** Only controlled page paths, without query strings or user-entered search terms. */
export function normalizeSource(source = "/"): string {
  const path = source.split(/[?#]/, 1)[0].replace(/^\/+|\/+$/g, "");
  if (!path || path === "home") return "home";
  return telegramSourcePages.includes(path) ? path : "unknown";
}

export function isTelegramDestination(destination: string): boolean {
  try { return new URL(destination).hostname === "t.me"; } catch { return false; }
}

export function telegramTrackedDestination(destination: string, source: string, token: string): string {
  const url = new URL(destination);
  for (const [key, value] of Object.entries({
    utm_source: TELEGRAM_PROJECT, utm_medium: "referral", utm_content: normalizeSource(source), rtk: token,
  })) {
    if (!url.searchParams.has(key)) url.searchParams.set(key, value);
  }
  return url.href;
}

export function getOutboundHref(href: string, source = "/"): string {
  if (!/^(?:https?:)?\/\//i.test(href)) return href;
  const entry = Object.entries(OUTBOUND_DESTINATIONS).find(([, url]) => href === url || href === `${url}/`);
  if (entry) return isTelegramDestination(entry[1])
    ? `/go/${entry[0]}/?s=${encodeURIComponent(normalizeSource(source))}`
    : `/go/${entry[0]}`;
  const post = /^https:\/\/t\.me\/robota_smila_ua\/([1-9]\d{0,14})\/?$/.exec(href);
  if (post) return `/go/telegram-post-${post[1]}/?s=${encodeURIComponent(normalizeSource(source))}`;
  throw new Error("External navigation destination is not allowlisted");
}
