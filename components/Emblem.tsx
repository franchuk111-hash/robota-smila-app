"use client";
import { motion } from "motion/react";

// Анімований логотип-бейдж (Motion): біла лупа на синьому градієнті.
// Легкий безкінечний «пошуковий» рух + вигин при наведенні.
export default function Emblem({ size = 38 }: { size?: number }) {
  const m = Math.round(size * 0.66);
  return (
    <motion.span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: "linear-gradient(145deg,#4f93f8,#2f6fda 70%,#2560c4)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "0 0 auto",
        boxShadow: "0 3px 10px rgba(47,111,218,.35)",
        overflow: "hidden",
      }}
      whileHover={{ rotate: -8, scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 250, damping: 13 }}
    >
      <motion.svg
        width={m}
        height={m}
        viewBox="0 0 100 100"
        animate={{ x: [0, 2.5, 0, -2.5, 0], y: [0, -2.5, 0, 2.5, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <circle cx="42" cy="42" r="24" fill="rgba(255,255,255,.16)" stroke="#fff" strokeWidth="9" />
        <line x1="60" y1="60" x2="83" y2="83" stroke="#fff" strokeWidth="11" strokeLinecap="round" />
        <circle cx="34" cy="34" r="5.5" fill="rgba(255,255,255,.6)" />
      </motion.svg>
    </motion.span>
  );
}
