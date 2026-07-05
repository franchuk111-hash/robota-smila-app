"use client";
import { motion } from "motion/react";

// Анімований логотип-бейдж (Motion) у стилі iOS-іконки: заокруглений
// квадрат (squircle), синій градієнт бренду, м'який глянець зверху та
// легка внутрішня тінь знизу для об'єму. Біла лупа + пошуковий рух.
export default function Emblem({ size = 38 }: { size?: number }) {
  const m = Math.round(size * 0.62);
  const radius = size * 0.223;
  return (
    <motion.span
      aria-hidden="true"
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: radius,
        background: "linear-gradient(160deg,#5b9dff 0%,#2f6fda 55%,#1f52ac 100%)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "0 0 auto",
        boxShadow:
          "0 3px 10px rgba(31,82,172,.4), inset 0 1px 1px rgba(255,255,255,.55), inset 0 -5px 8px rgba(10,30,70,.28)",
        overflow: "hidden",
      }}
      whileHover={{ rotate: -8, scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: "spring", stiffness: 250, damping: 13 }}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          background:
            "radial-gradient(120% 65% at 50% -8%, rgba(255,255,255,.55), rgba(255,255,255,0) 60%)",
          pointerEvents: "none",
        }}
      />
      <motion.svg
        width={m}
        height={m}
        viewBox="0 0 100 100"
        style={{ position: "relative" }}
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
