"use client";
import { motion } from "motion/react";
import { TELEGRAM_CHANNEL_URL } from "@/lib/data";
import { trackEvent, GA4_EVENTS } from "@/lib/ga4";

export default function SubscribeCTA({
  source,
  label = "Підписатись на Telegram",
  large = false,
}: {
  source: string;
  label?: string;
  large?: boolean;
}) {
  return (
    <motion.a
      href={TELEGRAM_CHANNEL_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={large ? "btn lg" : "btn"}
      onClick={() => trackEvent(GA4_EVENTS.TELEGRAM_SUBSCRIBE, { source })}
      whileHover={{ scale: 1.035 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 250, damping: 13 }}
    >
      {label}
    </motion.a>
  );
}
