import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbLd from "@/components/BreadcrumbLd";
import JsonLd from "@/components/JsonLd";
import { faqLd } from "@/lib/seo";
import {
  YEAR,
  MONTH_NAMES,
  MONTH_SLUGS,
  MONTH_GENITIVE,
  WEEKDAYS,
  HOLIDAYS,
  buildMonth,
  monthStats,
  yearStats,
  workDaysLabel,
  HOURS_PER_DAY,
} from "@/lib/calendar";

const stats = yearStats();
const october = monthStats(9);
const november = monthStats(10);
const december = monthStats(11);

export const metadata: Metadata = {
  title: `Виробничий календар ${YEAR} — ${stats.work} робочих днів, ${stats.holidays} свят`,
  description: `Виробничий календар України на ${YEAR} рік: ${stats.work} робочих днів, ${stats.off} вихідних і святкових, ${stats.holidays} державних свят та норми годин по місяцях. Жовтень ${YEAR} — ${workDaysLabel(october.work)}, ${october.hours} годин.`,
  alternates: { canonical: "/kalendar" },
  openGraph: {
    title: `Виробничий календар ${YEAR}: ${stats.work} робочих днів, ${stats.holidays} свят`,
    description: `Робочі, вихідні та святкові дні України на ${YEAR} рік з нормами годин по кожному місяцю.`,
    url: "https://robota-smila.com.ua/kalendar",
    type: "article",
  },
};

const FAQ = [
  {
    q: `Скільки робочих днів у ${YEAR} році в Україні?`,
    a: `У ${YEAR} році ${stats.work} робочих днів і ${stats.off} вихідних та святкових днів, з них ${stats.holidays} державних свят. При 40-годинному робочому тижні норма становить ${stats.work * HOURS_PER_DAY} годин.`,
  },
  {
    q: `Скільки робочих днів у жовтні ${YEAR}?`,
    a: `У жовтні ${YEAR} року ${workDaysLabel(october.work)} і ${october.off} вихідних та святкових. 1 жовтня — День захисників і захисниць України, неробочий день (четвер). Норма робочого часу — ${october.hours} годин.`,
  },
  {
    q: `Які святкові та неробочі дні у ${YEAR} році?`,
    a: `Державні свята ${YEAR} року: 1 січня — Новий рік, 8 березня — Міжнародний жіночий день, 12 квітня — Великдень, 1 травня — День праці, 9 травня — День перемоги над нацизмом, 31 травня — Трійця, 28 червня — День Конституції, 24 серпня — День Незалежності, 1 жовтня — День захисників і захисниць України, 25 грудня — Різдво Христове.`,
  },
  {
    q: `Скільки робочих годин у жовтні ${YEAR} при 40-годинному тижні?`,
    a: `У жовтні ${YEAR} року ${october.hours} робочих годин: ${october.work} робочих днів по ${HOURS_PER_DAY} годин кожен.`,
  },
  {
    q: `Чи переносяться вихідні через святкові дні у ${YEAR} році?`,
    a: `Перенесення вихідних днів у разі збігу зі святом у ${YEAR} році не застосовується: норми статті 67 КЗпП призупинені на період воєнного стану. Саме тому 8 березня, 12 квітня, 9 травня, 31 травня та 28 червня ${YEAR} року припадають на неділю чи суботу і не дають додаткових неробочих днів. Точний графік уточнюйте на своєму підприємстві.`,
  },
];

export default function CalendarPage() {
  return (
    <>
      <Header />
      <BreadcrumbLd
        items={[
          { name: "Головна", path: "/" },
          { name: `Виробничий календар ${YEAR}`, path: "/kalendar" },
        ]}
      />
      <JsonLd data={faqLd(FAQ)} />
      <div className="container">
        <nav className="crumbs">
          <Link href="/">Головна</Link> › Виробничий календар
        </nav>
        <h1 className="page-h1">Виробничий календар {YEAR}</h1>
        <p className="sub">
          Робочі, вихідні та святкові дні в Україні на {YEAR} рік і норми робочого часу
          по місяцях
        </p>

        <div className="cal-stats">
          <div className="cal-stat">
            <b>{stats.work}</b>
            <span>робочих днів</span>
          </div>
          <div className="cal-stat">
            <b>{stats.off}</b>
            <span>вихідних і святкових</span>
          </div>
          <div className="cal-stat">
            <b>{stats.holidays}</b>
            <span>державних свят</span>
          </div>
          <div className="cal-stat">
            <b>{stats.work * HOURS_PER_DAY}</b>
            <span>робочих годин за рік</span>
          </div>
        </div>

        <div className="cal-grid">
          {MONTH_NAMES.map((name, m) => {
            const ms = monthStats(m);
            return (
              <div className="cal-month" id={`${MONTH_SLUGS[m]}-${YEAR}`} key={m}>
                <h3>{name}</h3>
                <div className="cal-week">
                  {WEEKDAYS.map((w) => (
                    <span key={w} className="cal-wd">
                      {w}
                    </span>
                  ))}
                </div>
                <div className="cal-days">
                  {buildMonth(m).map((c, i) =>
                    c ? (
                      <span
                        key={i}
                        className={
                          "cal-day" +
                          (c.holiday ? " holiday" : c.weekend ? " weekend" : "")
                        }
                        title={c.holiday || undefined}
                      >
                        {c.day}
                      </span>
                    ) : (
                      <span key={i} className="cal-day empty" />
                    )
                  )}
                </div>
                <div
                  style={{
                    textAlign: "center",
                    fontSize: 13,
                    color: "var(--muted)",
                    marginTop: 10,
                  }}
                >
                  {workDaysLabel(ms.work)} · {ms.hours} год
                </div>
              </div>
            );
          })}
        </div>

        <div className="seo-text">
          <h2 id={`zhovten-${YEAR}`}>Жовтень {YEAR}: {workDaysLabel(october.work)}, {october.hours} годин</h2>
          <p>
            У жовтні {YEAR} року {workDaysLabel(october.work)} і {october.off} вихідних та
            святкових. Місяць починається зі святкового четверга: 1 жовтня — День
            захисників і захисниць України, офіційний неробочий день. Далі вихідні
            припадають на суботи й неділі: 3–4, 10–11, 17–18, 24–25 та 31 жовтня.
            Норма робочого часу — {october.hours} годин при 40-годинному робочому тижні.
          </p>
          <p>
            Додаткові перенесення вихідних на жовтень {YEAR} не передбачені, тому графік
            залишається стандартним 5/2. Для розрахунку зарплати, авансу, відпускних і
            лікарняних за жовтень беріть саме {workDaysLabel(october.work)} і{" "}
            {october.hours} годин.
          </p>

          <h2 id={`lystopad-${YEAR}`}>Листопад {YEAR}: {workDaysLabel(november.work)}, {november.hours} годин</h2>
          <p>
            У листопаді {YEAR} — {workDaysLabel(november.work)} та {november.off} вихідних.
            Державних свят цього місяця немає, тож кількість робочих днів визначають лише
            суботи й неділі. Норма робочого часу — {november.hours} годин.
          </p>

          <h2 id={`hruden-${YEAR}`}>Грудень {YEAR}: {workDaysLabel(december.work)}, {december.hours} годин</h2>
          <p>
            У грудні {YEAR} року {workDaysLabel(december.work)} та {december.off} вихідних і
            святкових. Єдине державне свято місяця — 25 грудня, Різдво Христове (п'ятниця),
            тож воно не створює додаткових перенесень. Норма робочого часу — {december.hours} годин.
          </p>

          <h2 id={`robochi-dni-po-misyatsyah-${YEAR}`}>
            Скільки робочих днів у кожному місяці {YEAR} року
          </h2>
          <ul>
            {MONTH_NAMES.map((name, m) => {
              const ms = monthStats(m);
              const holiday = ms.holidays.length
                ? ` — свято: ${ms.holidays
                    .map((h) => `${h.day} ${MONTH_GENITIVE[m]}`)
                    .join(", ")}`
                : "";
              return (
                <li key={m}>
                  <b>{name}</b> — {workDaysLabel(ms.work)}, {ms.hours} годин
                  {holiday}
                </li>
              );
            })}
          </ul>

          <h2 id={`yak-rahuyemo-${YEAR}`}>Як ми рахуємо робочі дні та години</h2>
          <p>
            Кількість робочих днів у {YEAR} році розрахована за календарем {YEAR} і
            офіційним переліком неробочих днів (стаття 73 КЗпП України у редакції 2023 року).
            Вихідні — субота та неділя; державне свято є неробочим незалежно від дня тижня.
            Якщо святковий день збігається з вихідним, додаткового неробочого дня не
            виникає — тому 8 березня, 12 квітня, 9 травня, 31 травня та 28 червня {YEAR} року
            не змінюють загальну кількість робочих днів.
          </p>
          <p>
            Норми годин наведені для 40-годинного робочого тижня з двома вихідними (по{" "}
            {HOURS_PER_DAY} годин на день). Для 36-годинного тижня норму беріть із
            виробничого календаря вашого підприємства.
          </p>
        </div>

        <div className="callout" style={{ marginTop: 30 }}>
          <b>Державні свята {YEAR}:</b>{" "}
          {Object.entries(HOLIDAYS).map(([iso, name], i, arr) => {
            const d = new Date(iso);
            return (
              <span key={iso}>
                {d.getUTCDate()}.{String(d.getUTCMonth() + 1).padStart(2, "0")} — {name}
                {i < arr.length - 1 ? " · " : ""}
              </span>
            );
          })}
        </div>
        <p style={{ color: "var(--muted2)", fontSize: 14, marginTop: 12 }}>
          * Довідково. В умовах воєнного стану перенесення вихідних може не діяти, а
          графік роботи підприємства визначається його внутрішніми документами.
        </p>

        <section className="faq-block">
          <h2 className="title" style={{ fontSize: 24 }}>
            Часті запитання про виробничий календар {YEAR}
          </h2>
          {FAQ.map((f, i) => (
            <details key={i} className="faq-item">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>

        <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 24 }}>
          Також на сайті:{" "}
          <Link href="/zarplatomir">зарплатомір Сміли</Link> ·{" "}
          <Link href="/robota-z-shchodennoyu-oplatoyu">робота з щоденною оплатою</Link> ·{" "}
          <Link href="/vakansii">усі вакансії Сміли</Link>
        </p>
      </div>
      <Footer />
    </>
  );
}
