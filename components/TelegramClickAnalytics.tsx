"use client";
import { useEffect } from "react";
import { COOKIE_CONSENT_KEY } from "@/lib/consent";
import { getOutboundDestination, isTelegramDestination, normalizeSource } from "@/lib/outbound-links";

/** Native links always navigate, even when analytics/storage is blocked. */
export default function TelegramClickAnalytics() {
  useEffect(() => {
    const capture = (event: MouseEvent) => {
      if (event.type === "auxclick" && event.button !== 1) return;
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement)) return;
      try {
        const url = new URL(anchor.href);
        if (url.origin !== window.location.origin) return;
        const match = /^\/go\/([^/]+)\/?$/.exec(url.pathname);
        const destination = match && getOutboundDestination(match[1]);
        if (!destination || !isTelegramDestination(destination)) return;
        const token = crypto.randomUUID();
        const original = anchor.getAttribute("href")!;
        url.searchParams.set("rtk", token);
        anchor.href = `${url.pathname}${url.search}`;
        // The browser consumes href synchronously as the event default action.
        setTimeout(() => anchor.setAttribute("href", original), 0);
        if (localStorage.getItem(COOKIE_CONSENT_KEY) !== "accepted") return;
        const gtag = (window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag;
        if (typeof gtag !== "function") return;
        gtag("event", "affiliate_click", {
          brand: match![1].startsWith("telegram-post-") ? "telegram-channel" : match![1],
          page_slug: normalizeSource(url.searchParams.get("s") ?? "unknown"),
          dest_host: new URL(destination).hostname,
          token,
          transport_type: "beacon",
        });
      } catch { /* Analytics must never interrupt the native link action. */ }
    };
    document.addEventListener("click", capture, true);
    document.addEventListener("auxclick", capture, true);
    return () => {
      document.removeEventListener("click", capture, true);
      document.removeEventListener("auxclick", capture, true);
    };
  }, []);
  return null;
}
