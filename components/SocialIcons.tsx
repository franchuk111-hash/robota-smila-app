// iOS-стиль іконок соцмереж: squircle-бейдж з фірмовим кольором платформи.
export function IconTikTok({ size = 22 }: { size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/icon-tiktok.png" alt="" width={size} height={size} style={{ borderRadius: size * 0.22 }} />;
}

export function IconYouTube({ size = 22 }: { size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/icon-youtube.png" alt="" width={size} height={size} style={{ borderRadius: size * 0.22 }} />;
}

export function IconTelegram({ size = 22 }: { size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/icon-telegram.png" alt="" width={size} height={size} style={{ borderRadius: size * 0.22 }} />;
}
