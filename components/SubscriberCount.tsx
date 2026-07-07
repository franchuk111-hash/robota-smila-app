"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";

// Показує реальну кількість підписників каналу (соц-доказ).
// Якщо число недоступне — нічого не рендерить.
export default function SubscriberCount({ compact = false }: { compact?: boolean }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/subscribers")
      .then((r) => r.json())
      .then((d) => {
        if (alive && typeof d.count === "number" && d.count > 0) setCount(d.count);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (count === null) return null;

  const formatted = count.toLocaleString("uk-UA");

  if (compact) {
    return (
      <span className="sub-count-inline">
        <span className="sub-dot" /> {formatted} підписників
      </span>
    );
  }

  return (
    <motion.div
      className="sub-count"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 14 }}
    >
      <span className="sub-dot" />
      <b>{formatted}</b> підписників у Telegram
    </motion.div>
  );
}
