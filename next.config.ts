import type { NextConfig } from "next";
import path from "path";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

// УВАГА: security-заголовки, http→https та www→apex НЕ роблю в застосунку.
// Під OpenNext/Cloudflare next.config headers()/redirects() і proxy працюють
// ненадійно: has-умови ігноруються, а source "/:path*" зациклює весь сайт у 308.
// Ці задачі виконуються на рівні Cloudflare (Always Use HTTPS, Transform Rules,
// Redirect Rules) — див. інструкцію в SECURITY.md.

const nextConfig: NextConfig = {
  // Не розкривати технологічний стек (прибирає x-powered-by)
  poweredByHeader: false,
  // /go/<id>/ must reach its server redirect without an intermediate 308.
  skipTrailingSlashRedirect: true,

  // Фіксуємо корінь воркспейсу на теку застосунку, щоб Next не чіпляв
  // сторонні файли з домашньої директорії (напр. чужий middleware.ts).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default async function config(phase: string): Promise<NextConfig> {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    const { initOpenNextCloudflareForDev } = await import("@opennextjs/cloudflare");
    await initOpenNextCloudflareForDev();
  }
  return nextConfig;
}
