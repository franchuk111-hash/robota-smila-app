"use client";
import { useEffect } from "react";
import { trackEvent } from "@/lib/ga4";
import { normalizeSource } from "@/lib/outbound-links";

/** Count navigation intent, never an application or a completed employer contact. */
export default function VacancyClickAnalytics() {
  useEffect(() => {
    const capture = (event: MouseEvent) => {
      if (event.type === "auxclick" && event.button !== 1) return;
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement)) return;
      try {
        const url = new URL(anchor.href);
        if (url.origin !== window.location.origin) return;
        const detail = /^\/vakansiya\/([1-9]\d{0,14})\/?$/.exec(url.pathname);
        const source = /^\/go\/source-([1-9]\d{0,14})\/?$/.exec(url.pathname);
        const match = detail || source;
        if (!match) return;
        const vacancyId = Number(match[1]);
        if (!Number.isSafeInteger(vacancyId)) return;
        const pageSlug = normalizeSource(window.location.pathname);
        const pagePath = pageSlug === "home" || pageSlug === "unknown" ? "/" : `/${pageSlug}`;
        trackEvent(detail ? "select_vacancy" : "vacancy_source_click", {
          vacancy_id: vacancyId,
          page_slug: pageSlug,
          page_location: `https://robota-smila.com.ua${pagePath}`,
          page_referrer: "",
          page_title: "Робота Сміла",
          transport_type: "beacon",
        });
      } catch { /* Analytics must never affect native navigation. */ }
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
