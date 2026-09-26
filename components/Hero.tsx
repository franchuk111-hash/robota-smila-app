"use client";
import { motion } from "motion/react";
import StatsMotion from "./StatsMotion";
import SubscribeCTA from "./SubscribeCTA";
import HeroVideoPortrait from "./HeroVideoPortrait";

const ease = [0.22, 1, 0.36, 1] as const;
const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

export default function Hero() {
  return (
    <section className="hero">
      <motion.div
        className="container hero-grid"
        variants={{ show: { transition: { staggerChildren: 0.12 } } }}
        initial="hidden"
        animate="show"
      >
        <div className="hero-copy">
          <motion.div className="hero-kicker" variants={item}>
            <span className="live-dot" aria-hidden="true" /> Нові вакансії Сміли щодня
          </motion.div>
          <motion.h1 variants={item}>
            Знайдіть роботу<br /><span>у своєму місті</span>
          </motion.h1>
          <motion.p variants={item}>
            Свіжі вакансії, зарплата й графік без зайвих переходів. Оберіть роботу на сайті — відкрийте точний пост у Telegram.
          </motion.p>
          <motion.form className="searchbar" action="/vakansii" method="get" variants={item}>
            <input type="text" name="q" aria-label="Пошук вакансій" placeholder="Наприклад: водій, продавець, без досвіду" />
            <motion.button className="btn" type="submit" whileTap={{ scale: 0.97 }}>
              Знайти вакансію
            </motion.button>
          </motion.form>
          <motion.div className="hero-actions" variants={item}>
            <SubscribeCTA source="homepage_hero" label="Підписатись у Telegram" />
            <span>Безкоштовно · лише вакансії Сміли</span>
          </motion.div>
          <StatsMotion />
        </div>

      </motion.div>
      <div className="hero-visual" aria-hidden="true">
        <HeroVideoPortrait />
      </div>
    </section>
  );
}
