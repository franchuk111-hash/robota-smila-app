// Генерує SVG карточку вакансії для Telegram
import { Vacancy } from "./data";

export function generateVacancyCardSVG(v: Vacancy): string {
  const width = 1080;
  const height = 1080;
  const padding = 40;

  // Кольори за категоріями
  const categoryColors: Record<string, string> = {
    prodavets: "#EC4899",
    voditel: "#F59E0B",
    robitnyk: "#8B5CF6",
    horeca: "#EF4444",
    ohorona: "#3B82F6",
    budivnyctvo: "#14B8A6",
    office: "#6366F1",
    other: "#6B7280",
  };

  const bgColor = categoryColors[v.cat] || "#6B7280";
  const dateStr = new Date(v.date).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <!-- Background with gradient -->
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${adjustBrightness(bgColor, -20)};stop-opacity:1" />
      </linearGradient>
      <linearGradient id="topGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.15" />
        <stop offset="100%" style="stop-color:#000000;stop-opacity:0" />
      </linearGradient>
    </defs>

    <!-- Main background -->
    <rect width="${width}" height="${height}" fill="url(#grad)"/>
    <rect width="${width}" height="${height}" fill="url(#topGrad)"/>

    <!-- Hot badge -->
    ${
      v.hot
        ? `
      <circle cx="${width - 80}" cy="80" r="50" fill="#FF4444" opacity="0.9"/>
      <text x="${width - 80}" y="95" font-size="48" font-weight="bold" fill="#FFF" text-anchor="middle">🔥</text>
    `
        : ""
    }

    <!-- Company logo circle -->
    <circle cx="${padding + 60}" cy="${padding + 60}" r="50" fill="rgba(255,255,255,0.2)"/>
    <text x="${padding + 60}" y="${padding + 80}" font-size="60" text-anchor="middle">${getEmoji(v.cat)}</text>

    <!-- Title -->
    <text x="${padding + 150}" y="${padding + 50}" font-size="42" font-weight="bold" fill="#FFF" font-family="Arial, sans-serif">
      ${escapeXML(v.title)}
    </text>

    <!-- Company name -->
    <text x="${padding + 150}" y="${padding + 95}" font-size="26" fill="rgba(255,255,255,0.85)" font-family="Arial, sans-serif">
      ${escapeXML(v.company)}
    </text>

    <!-- Divider line -->
    <line x1="${padding}" y1="220" x2="${width - padding}" y2="220" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>

    <!-- Salary section -->
    <text x="${padding}" y="310" font-size="32" font-weight="bold" fill="#FFF" font-family="Arial, sans-serif">💰 Зарплата</text>
    <text x="${padding}" y="360" font-size="40" font-weight="bold" fill="#FFF" font-family="Arial, sans-serif">
      ${v.salary[0] === 0 && v.salary[1] === 0 ? "Договірна" : `${v.salary[0].toLocaleString("uk-UA")} – ${v.salary[1].toLocaleString("uk-UA")} ₴`}
    </text>

    <!-- Details grid -->
    <text x="${padding}" y="470" font-size="28" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif">📍 ${escapeXML(v.district)}</text>
    <text x="${width / 2}" y="470" font-size="28" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif">🕐 ${escapeXML(v.schedule)}</text>

    <text x="${padding}" y="540" font-size="28" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif">${v.exp ? "💪 Досвід від 1 року" : "📚 Без досвіду"}</text>
    <text x="${width / 2}" y="540" font-size="28" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif">${escapeXML(v.typeName)}</text>

    <!-- Divider line 2 -->
    <line x1="${padding}" y1="620" x2="${width - padding}" y2="620" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>

    <!-- CTA Button -->
    <rect x="${padding}" y="680" width="${width - padding * 2}" height="100" rx="20" fill="#FFF" opacity="0.95"/>
    <text x="${width / 2}" y="750" font-size="40" font-weight="bold" fill="${bgColor}" text-anchor="middle" font-family="Arial, sans-serif">
      Відгукнутися на вакансію
    </text>

    <!-- Footer -->
    <text x="${width / 2}" y="${height - 40}" font-size="24" fill="rgba(255,255,255,0.6)" text-anchor="middle" font-family="Arial, sans-serif">
      robota-smila.com.ua · Вакансія ${v.id}
    </text>
  </svg>`;
}

function getEmoji(category: string): string {
  const emojis: Record<string, string> = {
    prodavets: "🛒",
    voditel: "🚚",
    robitnyk: "🏭",
    horeca: "🍽️",
    ohorona: "🛡️",
    budivnyctvo: "🏗️",
    office: "💼",
    other: "✨",
  };
  return emojis[category] || "💼";
}

function adjustBrightness(color: string, percent: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (
    0x1000000 +
    (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)
  ).toString(16).slice(1);
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
