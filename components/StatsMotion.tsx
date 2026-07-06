"use client";
import { motion } from "motion/react";
import Counter from "./Counter";

// Моушн-блок статистики в hero: пружинна поява зі стаггером,
// «поп» цифри після докрутки лічильника, акцентна лінія, що
// малюється, і жива пульсуюча точка біля «нових сьогодні».
const spring = { type: "spring" as const, stiffness: 220, damping: 14 };

const item = {
  hidden: { opacity: 0, y: 26, scale: 0.85 },
  show: { opacity: 1, y: 0, scale: 1, transition: spring },
};

const STATS = [
  { to: 420, suffix: "+", label: "активних вакансій", live: false },
  { to: 85, suffix: "", label: "компаній Сміли", live: false },
  { to: 17, suffix: "", label: "нових сьогодні", live: true },
];

export default function StatsMotion() {
  return (
    <motion.div
      className="stats"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.15, delayChildren: 0.45 } },
      }}
      initial="hidden"
      animate="show"
    >
      {STATS.map((s, i) => (
        <motion.div
          className="s"
          key={s.label}
          variants={item}
          whileHover={{ y: -4, transition: spring }}
        >
          <b>
            <motion.span
              style={{ display: "inline-block", fontSize: "inherit", color: "inherit" }}
              animate={{ scale: [1, 1.12, 1] }}
              transition={{
                delay: 0.45 + i * 0.15 + 1.25,
                duration: 0.35,
                ease: "easeOut",
              }}
            >
              <Counter to={s.to} suffix={s.suffix} />
            </motion.span>
          </b>
          <span className="stat-label">
            {s.live && <span className="live-dot" aria-hidden="true" />}
            {s.label}
          </span>
          <motion.span
            className="stat-line"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              delay: 0.65 + i * 0.15,
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
