// GA4 event tracking utility
export function trackEvent(eventName: string, eventParams?: Record<string, string | number>) {
  if (typeof window !== "undefined" && "gtag" in window) {
    (window as any).gtag("event", eventName, eventParams);
  }
}

export const GA4_EVENTS = {
  APPLY_VACANCY: "apply_vacancy",
  SHARE_VACANCY: "share_vacancy",
  TELEGRAM_SUBSCRIBE: "telegram_subscribe",
  SEARCH: "search",
  FILTER: "filter",
  VIEW_VACANCY: "view_vacancy",
};
