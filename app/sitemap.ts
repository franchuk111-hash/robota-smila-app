import type { MetadataRoute } from "next";
import { VACANCIES, COMPANIES, ARTICLES, CATEGORIES } from "@/lib/data";

const BASE = "https://robota-smila.com.ua";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/vakansii`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/kompanii`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/rabotodavtsyam`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/rezume`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/zarplatomir`, changeFrequency: "weekly", priority: 0.6 },
  ];
  const cats = CATEGORIES.map((c) => ({
    url: `${BASE}/vakansii?cat=${c.slug}`,
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
