"use client";
import { motion } from "motion/react";
import Counter from "./Counter";

const ease = [0.22, 1, 0.36, 1] as const;
const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

export default function Hero() {
  return (
    <section className="hero">
      <motion.span
        className="illus i1"
        data-parallax="0.18"
        data-rot="-8"
        initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
        animate={{ opacity: 1, scale: 1, rotate: -8 }}
        transition={{ delay: 0.5, duration: 0.6, ease }}
      >
        👩‍🍳
      </motion.span>
      <motion.span
        className="illus i2"
        data-parallax="-0.12"
        data-rot="7"
        initial={{ opacity: 0, scale: 0.6, rotate: 7 }}
        animate={{ opacity: 1, scale: 1, rotate: 7 }}
        transition={{ delay: 0.65, duration: 0.6, ease }}
      >
        🚚
      </motion.span>
      <motion.span
        className="illus i3"
        data-parallax="0.24"
        data-rot="-5"
        initial={{ opacity: 0, scale: 0.6, rotate: -5 }}
        animate={{ opacity: 1, scale: 1, rotate: -5 }}
        transition={{ delay: 0.8, duration: 0.6, ease }}
      >
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
        <motion.div className="stats" variants={item}>
          <div className="s">
            <b><Counter to={420} suffix="+" /></b>
            <span>активних вакансій</span>
          </div>
          <div className="s">
            <b><Counter to={85} /></b>
            <span>компаній Сміли</span>
          </div>
          <div className="s">
            <b><Counter to={17} /></b>
            <span>нових сьогодні</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
