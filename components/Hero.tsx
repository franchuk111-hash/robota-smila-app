"use client";
import { motion } from "motion/react";
import StatsMotion from "./StatsMotion";

const ease = [0.22, 1, 0.36, 1] as const;
const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

// Плаваюча анімація для емодзі: поява + безкінечний bob і легке похитування.
function floatAnim(delay: number, rot: [number, number, number]) {
  return {
    initial: { opacity: 0, scale: 0.6, rotate: rot[0] },
    animate: { opacity: 1, scale: 1, y: [0, -14, 0], rotate: rot },
    transition: {
      opacity: { delay, duration: 0.6, ease },
      scale: { delay, duration: 0.6, ease },
      y: { delay, duration: 3.6, repeat: Infinity, ease: "easeInOut" as const },
      rotate: { delay, duration: 5, repeat: Infinity, ease: "easeInOut" as const },
    },
  };
}

export default function Hero() {
  return (
    <section className="hero">
      <motion.span className="illus i1" data-parallax="0.18" {...floatAnim(0.5, [-10, -6, -10])}>
        👩‍🍳
      </motion.span>
      <motion.span className="illus i2" data-parallax="-0.12" {...floatAnim(0.65, [5, 9, 5])}>
        🚚
      </motion.span>
      <motion.span className="illus i3" data-parallax="0.24" {...floatAnim(0.8, [-7, -3, -7])}>
        🧑‍💼
      </motion.span>

      <motion.div
        className="container"
        variants={{ show: { transition: { staggerChildren: 0.12 } } }}
        initial="hidden"
        animate="show"
      >
        <motion.h1 variants={item}>
          Робота в Смілі —
          <br />
          знайдіть прямо зараз
        </motion.h1>
        <motion.p variants={item}>
          Актуальні вакансії у Смілі та Черкаській області. Повна і часткова
          зайнятість, підробіток, робота без досвіду.
        </motion.p>
        <motion.form className="searchbar" action="/vakansii" method="get" variants={item}>
          <input type="text" name="q" placeholder="Посада, компанія або ключове слово" />
          <input type="text" value="Сміла" readOnly style={{ maxWidth: 200, flex: "0 0 200px" }} />
          <motion.button
            className="btn"
            type="submit"
            whileHover={{ scale: 1.045 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 250, damping: 13 }}
          >
            Шукати
          </motion.button>
        </motion.form>
        <StatsMotion />
      </motion.div>
    </section>
  );
}
