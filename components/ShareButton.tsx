"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { trackEvent, GA4_EVENTS } from "@/lib/ga4";

export default function ShareButton({
  title,
  url,
  standalone = false,
}: {
  title: string;
  url: string;
  standalone?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const share = async (e: React.MouseEvent) => {
    e.preventDefault();
    trackEvent(GA4_EVENTS.SHARE_VACANCY);
    const fullUrl = typeof window !== "undefined" ? window.location.origin + url : url;
    if (navigator.share) {
      try {
        await navigator.share({ title, url: fullUrl });
      } catch {
        // користувач закрив діалог — нічого не робимо
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard недоступний — ігноруємо
    }
  };

  return (
    <motion.button
      className={standalone ? "share-btn standalone" : "share-btn"}
      aria-label="Поділитися вакансією"
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 250, damping: 13 }}
      onClick={share}
    >
      {standalone
        ? copied
          ? "✓ Скопійовано"
          : "↗ Поділитися"
        : copied
          ? "✓"
          : "↗"}
    </motion.button>
  );
}
