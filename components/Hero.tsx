"use client";
import { motion } from "motion/react";
import StatsMotion from "./StatsMotion";
import DisplayCards from "./DisplayCards";

const ease = [0.22, 1, 0.36, 1] as const;
const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

export default function Hero() {
  return (
    <section className="hero">
      <DisplayCards />

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
