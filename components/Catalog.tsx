"use client";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { readCatalogFilters, writeCatalogFilters, type CatalogFilterKey } from "@/lib/catalog-filters";
import { motion, AnimatePresence } from "motion/react";
import VacCard from "./VacCard";
import JsonLd from "./JsonLd";
import { matchesVacancyQuery } from "@/lib/vacancy-search";
import { experienceStatus, mentionsBooking, meetsSalaryMinimum } from "@/lib/vacancy-facts";
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
  itemList,
}: {
  vacancies: Vacancy[];
  categories: Category[];
  itemList: unknown;
}) {
  const searchParams = useSearchParams();
  const { cats, types, exp, query, minSalary, booking } = readCatalogFilters(
    new URLSearchParams(searchParams.toString()), categories.map((category) => category.slug)
  );
  const updateFilter = (key: CatalogFilterKey, values: string[]) => {
    const params = writeCatalogFilters(new URLSearchParams(window.location.search), key, values);
    const suffix = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${suffix ? `?${suffix}` : ""}${window.location.hash}`);
  };
  const setQuery = (value: string) => updateFilter("q", [value]);
  const setCats = (values: Set<string>) => updateFilter("cat", [...values]);
  const setTypes = (values: Set<string>) => updateFilter("type", [...values]);
  const setExp = (value: boolean) => updateFilter("exp", value ? ["1"] : []);
  const q = query.trim().toLowerCase();

  const items = useMemo(() => {
    let list = vacancies.slice();
    if (cats.size) list = list.filter((v) => cats.has(v.cat));
    if (types.size) list = list.filter((v) => types.has(v.type));
    if (booking) list = list.filter(mentionsBooking);
    if (minSalary) list = list.filter(v => meetsSalaryMinimum(v, minSalary));
    if (exp) list = list.filter((v) => experienceStatus(v) === "not-required");
    if (q)
      list = list.filter((v) =>
        matchesVacancyQuery(v, q)
      );
    return list.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [vacancies, cats, types, exp, q, minSalary, booking]);

  const toggle = (set: Set<string>, val: string, fn: (s: Set<string>) => void) => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    fn(next);
  };

  const heading =
    cats.size === 1
      ? `${categories.find((c) => cats.has(c.slug))?.name} — робота у Смілі`
      : "Вакансії у Смілі";

  return (
    <div className="container">
      {!query.trim() && !cats.size && !types.size && !exp && !minSalary && !booking && <JsonLd data={itemList} />}
      <nav className="crumbs">
        <a href="/">Головна</a> › Вакансії
      </nav>
      <h1 className="page-h1">{heading}</h1>
      <p className="sub">Актуальні пропозиції роботи з фільтрами за напрямком і графіком</p>

      <form className="searchbar" onSubmit={(event) => event.preventDefault()}>
        <input type="search" aria-label="Пошук вакансій" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Наприклад: водій, без досвіду" />
        {query && <button type="button" className="btn" onClick={() => setQuery("")}>Очистити</button>}
      </form>

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
            <label htmlFor="minimum-salary">Зазначена оплата від, ₴</label>
            <select id="minimum-salary" value={minSalary} onChange={e => updateFilter("min_salary", e.target.value === "0" ? [] : [e.target.value])}>
              {[0, 10000, 15000, 20000, 25000, 30000].map(value => <option key={value} value={value}>{value ? value.toLocaleString("uk-UA") : "Будь-яка"}</option>)}
              {minSalary > 0 && ![10000, 15000, 20000, 25000, 30000].includes(minSalary) && <option value={minSalary}>{minSalary.toLocaleString("uk-UA")}</option>}
            </select>
            <p className="filter-help">За нижньою межею в оголошенні. Період оплати та суму після податків уточнюйте у джерелі.</p>
            <label><input type="checkbox" checked={booking} onChange={e => updateFilter("booking", e.target.checked ? ["1"] : [])} />Згадано можливість бронювання</label>
            {booking && <p className="filter-help">Це текст роботодавця, а не гарантія бронювання. Перевірте умови в оригіналі вакансії.</p>}

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

        <section aria-label="Результати пошуку">
          <div className="count" role="status" aria-live="polite">
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
        </section>
      </div>
    </div>
  );
}
