"use client";
import { motion } from "motion/react";
import { trackEvent, GA4_EVENTS } from "@/lib/ga4";

const spring = { type: "spring" as const, stiffness: 250, damping: 13 };

export default function ApplyTelegram({
  href,
  vacancyId,
  vacancyTitle,
  category,
}: {
  href: string;
  vacancyId: number;
  vacancyTitle: string;
  category: string;
}) {
  const handleApply = () => {
    trackEvent(GA4_EVENTS.APPLY_VACANCY, {
      vacancy_id: vacancyId,
      vacancy_title: vacancyTitle,
      category,
      channel: "telegram",
    });
  };

  return (
    <aside className="aside-apply">
      <h3 style={{ marginTop: 0 }}>Відгукнутися</h3>
      <p style={{ color: "var(--muted)", fontSize: 15, margin: "0 0 16px" }}>
        Усі деталі вакансії та зв&apos;язок із роботодавцем — у нашому Telegram-каналі.
        Тисни кнопку й відгукуйся за секунду.
      </p>
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleApply}
        className="btn tg-apply"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          width: "100%",
          fontSize: 18,
        }}
        whileHover={{ scale: 1.035 }}
        whileTap={{ scale: 0.96 }}
        transition={spring}
      >
        <TelegramGlyph />
        Відгукнутися в Telegram
      </motion.a>
      <p style={{ color: "var(--muted)", fontSize: 13, margin: "12px 0 0" }}>
        Відкриється Telegram · @robota_smila_ua
      </p>
    </aside>
  );
}

function TelegramGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71l-4.14-3.05-1.99 1.93c-.23.23-.42.42-.83.42z" />
    </svg>
  );
}
