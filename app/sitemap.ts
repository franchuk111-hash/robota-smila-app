import { LANDINGS } from "@/lib/seo";
import type { MetadataRoute } from "next";
import { getActiveVacancies, COMPANIES, ARTICLES, CATEGORIES } from "@/lib/data";

const BASE = "https://robota-smila.com.ua";

// Дата останнього оновлення сторінок, які редагуються вручну (не вакансії).
// Оновлювати разом із правкою контенту — Google використовує lastmod як сигнал
// переобходу, тому дата має бути чесною, а не датою збірки.
const UPDATED = "2026-10-02";
const CONTENT_UPDATED = "2026-11-03";
const MODIFIED_STATIC_PATHS = new Set(["/", "/blog", "/rezume", "/zarplatomir", "/robota-bez-dosvidu", "/pidrobitok", "/robota-dlya-studentiv", "/terminovi-vakansii", "/robota-z-shchodennoyu-oplatoyu"]);
const MODIFIED_CATEGORIES = new Set(["prodavets", "robitnyk", "horeca", "office", "budivnyctvo", "other"]);

export default function sitemap(): MetadataRoute.Sitemap {
  const VACANCIES = getActiveVacancies();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: "2026-10-22", changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/vakansii`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/kompanii`, lastModified: UPDATED, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/blog`, lastModified: UPDATED, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/rabotodavtsyam`, lastModified: UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/rezume`, lastModified: UPDATED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/zarplatomir`, lastModified: UPDATED, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/kalendar`, lastModified: "2026-10-22", changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/start-kariery`, lastModified: UPDATED, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/robota-bez-dosvidu`, lastModified: UPDATED, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/pidrobitok`, lastModified: UPDATED, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/robota-dlya-studentiv`, lastModified: UPDATED, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/terminovi-vakansii`, lastModified: UPDATED, changeFrequency: "hourly", priority: 0.8 },
    { url: `${BASE}/robota-z-shchodennoyu-oplatoyu`, lastModified: UPDATED, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/aktsiya`, lastModified: UPDATED, changeFrequency: "weekly", priority: 0.7 },
  ];
  for (const page of staticPages) {
    if (MODIFIED_STATIC_PATHS.has(new URL(page.url).pathname)) page.lastModified = CONTENT_UPDATED;
  }
  // Empty editorial selections remain available, but do not compete in the index.
  const indexableStaticPages = staticPages.filter(page => {
    const landing = LANDINGS.find(item => `/${item.slug}` === new URL(page.url).pathname);
    return !landing || VACANCIES.some(landing.filter);
  });
  for (const page of indexableStaticPages) {
    if (["/zarplatomir", ...LANDINGS.map(item => `/${item.slug}`)].includes(new URL(page.url).pathname)) page.lastModified = "2026-11-04";
  }
  for (const page of indexableStaticPages) {
    if (["/zarplatomir", "/vakansii", "/kalendar"].includes(new URL(page.url).pathname)) page.lastModified = "2026-11-05";
  }
  const cats = CATEGORIES.filter((c) => VACANCIES.some((v) => v.cat === c.slug)).map((c) => ({
    url: `${BASE}/vakansii/${c.slug}`,
    ...(["voditel", "ohorona"].includes(c.slug)
      ? { lastModified: "2026-11-05" }
      : MODIFIED_CATEGORIES.has(c.slug) ? { lastModified: CONTENT_UPDATED } : {}),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));
  const vacs = VACANCIES.map((v) => ({
    url: `${BASE}/vakansiya/${v.id}`,
    lastModified: v.date,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));
  const comps = COMPANIES.filter((c) => VACANCIES.some((v) => v.company === c.name)).map((c) => ({
    url: `${BASE}/kompaniya/${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
  const arts = ARTICLES.map((a) => ({
    url: `${BASE}/blog/${a.slug}`,
    lastModified: a.dateModified ?? a.date,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [...indexableStaticPages, ...cats, ...vacs, ...comps, ...arts];
}

export const dynamic = "force-dynamic";
