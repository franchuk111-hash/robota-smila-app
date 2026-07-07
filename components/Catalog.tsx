"use client";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import VacCard from "./VacCard";
import { Vacancy, Category } from "@/lib/data";

const filterGroupVariants = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const labelVariants = {
  hidden: { opacity: 0, x: -8 },
  show: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.04, duration: 0.25, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function Catalog({
  vacancies,
  categories,
  initialQ = "",
  initialCat = "",
  initialExp = false,
}: {
  vacancies: Vacancy[];
  categories: Category[];
  initialQ?: string;
  initialCat?: string;
  initialExp?: boolean;
}) {
  const [cats, setCats] = useState<Set<string>>(
    new Set(initialCat ? [initialCat] : [])
  );
  const [types, setTypes] = useState<Set<string>>(new Set());
  const [exp, setExp] = useState(initialExp);
  const q = initialQ.toLowerCase();

  const items = useMemo(() => {
    let list = vacancies.slice();
    if (cats.size) list = list.filter((v) => cats.has(v.cat));
    if (types.size) list = list.filter((v) => types.has(v.type));
    if (exp) list = list.filter((v) => !v.exp);
    if (q)
      list = list.filter((v) =>
        (v.title + " " + v.company + " " + v.short).toLowerCase().includes(q)
      );
    return list.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [vacancies, cats, types, exp, q]);

  const toggle = (set: Set<string>, val: string, fn: (s: Set<string>) => void) => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    fn(next);
  };

  const heading =
    cats.size === 1
      ? categories.find((c) => cats.has(c.slug))?.name + " — робота у Смілі"
      : "Вакансії у Смілі";

  return (
    <div className="container">
      <nav className="crumbs">
        <a href="/">Головна</a> › Вакансії
      </nav>
      <h1 className="page-h1">{heading}</h1>
      <p className="sub">Актуальні пропозиції роботи з фільтрами за напрямком і графіком</p>

      <div className="layout">
        <aside className="filters">
          <motion.h3 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            Фільтри
          </motion.h3>
          <motion.div
            className="fgroup"
            custom={0}
            initial="hidden"
            animate="show"
            variants={filterGroupVariants}
          >
            <div className="lbl">Категорія</div>
            {categories.map((c, i) => (
              <motion.label
                key={c.slug}
                custom={i}
                initial="hidden"
                animate="show"
                variants={labelVariants}
              >
                <input
                  type="checkbox"
                  checked={cats.has(c.slug)}
                  onChange={() => toggle(cats, c.slug, setCats)}
                />
                {c.name}
              </motion.label>
            ))}
          </motion.div>
          <motion.div
            className="fgroup"
            custom={1}
            initial="hidden"
            animate="show"
            variants={filterGroupVariants}
          >
            <div className="lbl">Зайнятість</div>
            {[
              ["FULL_TIME", "Повна"],
              ["PART_TIME", "Часткова"],
              ["SHIFT", "Змінна"],
            ].map(([val, label], i) => (
              <motion.label
                key={val}
                custom={i}
                initial="hidden"
                animate="show"
                variants={labelVariants}
              >
                <input
                  type="checkbox"
                  checked={types.has(val)}
                  onChange={() => toggle(types, val, setTypes)}
                />
                {label}
              </motion.label>
            ))}
          </motion.div>
          <motion.div
            className="fgroup"
            custom={2}
            initial="hidden"
            animate="show"
            variants={filterGroupVariants}
          >
            <div className="lbl">Умови</div>
            <motion.label
              custom={0}
              initial="hidden"
              animate="show"
              variants={labelVariants}
            >
              <input
                type="checkbox"
                checked={exp}
                onChange={(e) => setExp(e.target.checked)}
              />
              Без досвіду
            </motion.label>
          </motion.div>
        </aside>

        <main>
          <div className="count">
            Знайдено вакансій: {items.length}
            {q ? ` за запитом «${q}»` : ""}
          </div>
          {items.length ? (
            <motion.div className="grid2" layout>
              <AnimatePresence mode="popLayout">
                {items.map((v) => (
                  <motion.div
                    key={v.id}
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.24, ease: "easeOut" }}
                  >
                    <VacCard v={v} noReveal />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="vac">
              За вашим запитом вакансій не знайдено. Спробуйте змінити фільтри.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
