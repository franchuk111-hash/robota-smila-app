import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Фіксуємо корінь воркспейсу на теку застосунку, щоб Next не чіпляв
  // сторонні файли з домашньої директорії (напр. чужий middleware.ts).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
