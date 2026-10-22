import { COOKIE_CONSENT_KEY } from "./consent";
// GA4 event tracking utility
export function trackEvent(eventName: string, eventParams?: Record<string, string | number>) {
  try {
    if (typeof window !== "undefined" && localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted") {
      const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag;
      if (typeof gtag === "function") gtag("event", eventName, eventParams);
    }
  } catch { /* Analytics and storage failures must not affect navigation or forms. */ }
}

export const GA4_EVENTS = {
  APPLY_VACANCY: "apply_vacancy",
  SHARE_VACANCY: "share_vacancy",
  TELEGRAM_SUBSCRIBE: "telegram_subscribe",
  SEARCH: "search",
  FILTER: "filter",
  VIEW_VACANCY: "view_vacancy",
};
