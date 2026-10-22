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
  description: `Виробничий календар України на ${YEAR} рік: ${stats.work} робочих днів, ${stats.off} вихідних за графіком 5/2, ${stats.holidays} святкових дат та години за базовим графіком по місяцях. Жовтень ${YEAR} — ${workDaysLabel(october.work)}, ${october.hours} годин.`,
  alternates: { canonical: "/kalendar" },
  openGraph: {
    title: `Виробничий календар ${YEAR}: ${stats.work} робочих днів, ${stats.holidays} свят`,
    description: `Робочі, вихідні та святкові дні України на ${YEAR} рік за базовим графіком Пн–Пт по 8 годин.`,
    url: "https://robota-smila.com.ua/kalendar",
    type: "article",
  },
};

const FAQ = [
  {
    q: `Скільки робочих днів у ${YEAR} році в Україні?`,
    a: `За базовим графіком Пн–Пт по 8 годин у ${YEAR} році ${stats.work} робочих днів і ${stats.off} вихідних. Окремо позначено ${stats.holidays} святкових дат. При 40-годинному робочому тижні розрахунок становить ${stats.work * HOURS_PER_DAY} годин.`,
  },
  {
    q: `Скільки робочих днів у жовтні ${YEAR}?`,
    a: `У жовтні ${YEAR} року ${workDaysLabel(october.work)} і ${october.off} вихідних за графіком 5/2. 1 жовтня — День захисників і захисниць України (четвер); у базовому графіку це робочий день. За базовим графіком — ${october.hours} годин.`,
  },
  {
    q: `Які святкові дати у ${YEAR} році?`,
    a: `Святкові дати ${YEAR} року (не автоматичні вихідні): 1 січня — Новий рік, 8 березня — Міжнародний жіночий день, 12 квітня — Великдень, 1 травня — День праці, 8 травня — День пам’яті та перемоги над нацизмом, 31 травня — Трійця, 28 червня — День Конституції, 15 липня — День Української Державності, 24 серпня — День Незалежності, 1 жовтня — День захисників і захисниць України, 25 грудня — Різдво Христове.`,
  },
  {
    q: `Скільки робочих годин у жовтні ${YEAR} при 40-годинному тижні?`,
    a: `У жовтні ${YEAR} року ${october.hours} робочих годин: ${october.work} робочих днів по ${HOURS_PER_DAY} годин кожен.`,
  },
  {
    q: `Чи переносяться вихідні через святкові дні у ${YEAR} році?`,
    a: `Під час дії воєнного стану частина 6 статті 6 Закону № 2136-IX передбачає незастосування статті 73 та відповідних норм статті 67 КЗпП. Святкова дата сама по собі не створює вихідного чи перенесення. Наш розрахунок використовує Пн–Пт без перенесень; фактичний графік встановлює роботодавець. Якщо правовий режим зміниться, графік потрібно переглянути.`,
  },
];

export default function CalendarPage() {
  return (
    <>
      <Header />
      <main>
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
          Робочі, вихідні та святкові дні в Україні на {YEAR} рік і розрахунок робочого часу
          по місяцях. Базовий графік: понеділок–п’ятниця по 8 годин, без автоматичних святкових вихідних і перенесень.
        </p>

        <div className="cal-stats">
          <div className="cal-stat">
            <b>{stats.work}</b>
            <span>робочих днів</span>
          </div>
          <div className="cal-stat">
            <b>{stats.off}</b>
            <span>вихідних за графіком 5/2</span>
          </div>
          <div className="cal-stat">
            <b>{stats.holidays}</b>
            <span>святкових дат</span>
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
          <h2 id={`zhovten-rozrahunok-${YEAR}`}>Жовтень {YEAR}: {workDaysLabel(october.work)}, {october.hours} годин</h2>
          <p>
            У жовтні {YEAR} року {workDaysLabel(october.work)} і {october.off} вихідних за графіком 5/2. Місяць починається в четвер: 1 жовтня — День
            захисників і захисниць України; позначення свята не виключає його з базового робочого графіка. Далі вихідні
            припадають на суботи й неділі: 3–4, 10–11, 17–18, 24–25 та 31 жовтня.
            За базовим графіком — {october.hours} годин при 40-годинному робочому тижні.
          </p>
          <p>
            Розрахунок для жовтня {YEAR} використовує графік 5/2 без перенесень:
            {" "}{workDaysLabel(october.work)} і {october.hours} годин.
            Для нарахування виплат використовуйте затверджений графік і табель вашого роботодавця.
          </p>

          <h2 id={`lystopad-rozrahunok-${YEAR}`}>Листопад {YEAR}: {workDaysLabel(november.work)}, {november.hours} годин</h2>
          <p>
            У листопаді {YEAR} — {workDaysLabel(november.work)} та {november.off} вихідних.
            Державних свят цього місяця немає, тож кількість робочих днів визначають лише
            суботи й неділі. За базовим графіком — {november.hours} годин.
          </p>

          <h2 id={`hruden-rozrahunok-${YEAR}`}>Грудень {YEAR}: {workDaysLabel(december.work)}, {december.hours} годин</h2>
          <p>
            У грудні {YEAR} року {workDaysLabel(december.work)} та {december.off} вихідних за графіком 5/2. Єдине державне свято місяця — 25 грудня, Різдво Христове (п'ятниця),
            у базовому графіку ця п’ятниця врахована як робоча. За базовим графіком — {december.hours} годин.
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
            Розрахунок охоплює всі понеділки–п’ятниці {YEAR} року; суботи й неділі
            враховані як вихідні. Святкові дати показані довідково та не віднімаються
            від робочих днів. Це базовий календар 5/2, а не індивідуальна норма підприємства.
            Під час воєнного стану стаття 73 та відповідні норми про перенесення вихідних
            не застосовуються згідно з частиною 6 статті 6 Закону № 2136-IX.
            Розрахунок не прогнозує тривалість воєнного стану; у разі зміни законодавства
            чи графіка роботодавця його потрібно уточнити.
          </p>
          <p>
            Години розраховані для 40-годинного робочого тижня з двома вихідними (по{" "}
            {HOURS_PER_DAY} годин на день). Для 36-годинного тижня норму беріть із
            виробничого календаря вашого підприємства.
          </p>
        </div>

        <div className="callout" style={{ marginTop: 30 }}>
          <b>Святкові дати {YEAR}:</b>{" "}
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
          * Довідково. Позначення свята не означає вихідного. Фактичний режим роботи
          та години уточнюйте у роботодавця. Джерела: <a href="https://zakon.rada.gov.ua/laws/show/322-08#Text" target="_blank" rel="noopener noreferrer">стаття 73 КЗпП</a>{" "}
          і <a href="https://zakon.rada.gov.ua/laws/show/2136-20#Text" target="_blank" rel="noopener noreferrer">стаття 6 Закону № 2136-IX</a>.
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
            </main>
<Footer />
    </>
  );
}
