import type { NextConfig } from "next";
import path from "path";

// УВАГА: security-заголовки, http→https та www→apex НЕ роблю в застосунку.
// Під OpenNext/Cloudflare next.config headers()/redirects() і proxy працюють
// ненадійно: has-умови ігноруються, а source "/:path*" зациклює весь сайт у 308.
// Ці задачі виконуються на рівні Cloudflare (Always Use HTTPS, Transform Rules,
// Redirect Rules) — див. інструкцію в SECURITY.md.

const nextConfig: NextConfig = {
  // Не розкривати технологічний стек (прибирає x-powered-by)
  poweredByHeader: false,

  // Фіксуємо корінь воркспейсу на теку застосунку, щоб Next не чіпляв
  // сторонні файли з домашньої директорії (напр. чужий middleware.ts).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
