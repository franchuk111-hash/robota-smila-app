import type { MetadataRoute } from "next";
import { VACANCIES, COMPANIES, ARTICLES, CATEGORIES } from "@/lib/data";

const BASE = "https://robota-smila.com.ua";

// Дата останнього оновлення сторінок, які редагуються вручну (не вакансії).
// Оновлювати разом із правкою контенту — Google використовує lastmod як сигнал
// переобходу, тому дата має бути чесною, а не датою збірки.
const UPDATED = "2026-09-26";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: UPDATED, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/vakansii`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/kompanii`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/rabotodavtsyam`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/rezume`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/zarplatomir`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/kalendar`, lastModified: UPDATED, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/start-kariery`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/robota-bez-dosvidu`, lastModified: UPDATED, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/pidrobitok`, lastModified: UPDATED, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/robota-dlya-studentiv`, lastModified: UPDATED, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/terminovi-vakansii`, lastModified: UPDATED, changeFrequency: "hourly", priority: 0.8 },
    { url: `${BASE}/robota-z-shchodennoyu-oplatoyu`, lastModified: UPDATED, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/aktsiya`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/polityka-konfidentsiynosti`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/umovy-korystuvannya`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/polityka-cookie`, changeFrequency: "yearly", priority: 0.3 },
  ];
  const cats = CATEGORIES.map((c) => ({
    url: `${BASE}/vakansii/${c.slug}`,
    lastModified: UPDATED,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));
  const vacs = VACANCIES.map((v) => ({
    url: `${BASE}/vakansiya/${v.id}`,
    lastModified: v.date,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));
  const comps = COMPANIES.map((c) => ({
    url: `${BASE}/kompaniya/${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
  const arts = ARTICLES.map((a) => ({
    url: `${BASE}/blog/${a.slug}`,
    lastModified: a.date,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [...staticPages, ...cats, ...vacs, ...comps, ...arts];
}
