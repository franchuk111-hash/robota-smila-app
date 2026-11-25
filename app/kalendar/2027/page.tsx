import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbLd from "@/components/BreadcrumbLd";
import JsonLd from "@/components/JsonLd";
import CalendarGrid from "@/components/CalendarGrid";
import { faqLd } from "@/lib/seo";
import {
  HOLIDAYS_2027,
  MONTH_NAMES,
  MONTH_SLUGS,
  MONTH_GENITIVE,
  HOURS_PER_DAY,
  monthStats,
  yearStats,
  workDaysLabel,
} from "@/lib/calendar";

const Y = 2027;
const stats = yearStats(Y);
const january = monthStats(0, Y);
const may = monthStats(4, Y);
const december = monthStats(11, Y);
const DOW = ["неділя", "понеділок", "вівторок", "середа", "четвер", "пʼятниця", "субота"];

const holidays = Object.entries(HOLIDAYS_2027).map(([iso, name]) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return { iso, name, label: `${d.getUTCDate()} ${MONTH_GENITIVE[d.getUTCMonth()]}`, dow: DOW[d.getUTCDay()], weekend: [0, 6].includes(d.getUTCDay()) };
});
const onWeekend = holidays.filter((h) => h.weekend);

export const metadata: Metadata = {
  title: `Виробничий календар ${Y}: робочі дні та години по місяцях`,
  description: `Робочі дні ${Y} за графіком 5/2: за рік ${workDaysLabel(stats.work)} і ${stats.work * HOURS_PER_DAY} год; січень ${workDaysLabel(january.work)}, грудень ${workDaysLabel(december.work)}. Свята ${Y} з днями тижня.`,
  alternates: { canonical: `/kalendar/${Y}` },
  openGraph: {
    title: `Виробничий календар ${Y}: робочі дні та години`,
    description: `Робочі, вихідні та святкові дні України на ${Y} рік за базовим графіком Пн–Пт по 8 годин.`,
    url: `https://robota-smila.com.ua/kalendar/${Y}`,
    type: "article",
  },
};

const FAQ = [
  {
    q: `Скільки робочих днів у ${Y} році?`,
    a: `За базовим графіком Пн–Пт по 8 годин у ${Y} році ${stats.work} робочих днів і ${stats.off} вихідних, тобто ${stats.work * HOURS_PER_DAY} годин при 40-годинному тижні. Святкові дати в цьому розрахунку не віднімаються.`,
  },
  {
    q: `Скільки робочих днів у січні ${Y}?`,
    a: `У січні ${Y} року ${workDaysLabel(january.work)}, ${january.off} вихідних і ${january.hours} годин за графіком 5/2. 1 січня припадає на пʼятницю; у базовому графіку воєнного стану це робочий день.`,
  },
  {
    q: `Скільки робочих днів у грудні ${Y}?`,
    a: `У грудні ${Y} року ${workDaysLabel(december.work)}, ${december.off} вихідних і ${december.hours} години за графіком 5/2. Різдво, 25 грудня, припадає на суботу.`,
  },
  {
    q: `Коли Великдень і Трійця у ${Y} році?`,
    a: `Великдень у ${Y} році припадає на 2 травня (неділя), Трійця на 20 червня (неділя).`,
  },
  {
    q: `Чи будуть додаткові вихідні через свята у ${Y} році?`,
    a: `Поки діє воєнний стан, частина 6 статті 6 Закону № 2136-IX зупиняє дію статті 73 КЗпП і перенесення вихідних за статтею 67. Тоді свято саме по собі не дає вихідного. Якщо воєнний стан на дату свята не діятиме, вихідний, що збігся зі святом у суботу чи неділю, переноситься на наступний робочий день.`,
  },
];

export default function Calendar2027Page() {
  return (
    <>
      <Header />
      <main>
        <BreadcrumbLd
          items={[
            { name: "Головна", path: "/" },
            { name: "Виробничий календар", path: "/kalendar" },
            { name: `Виробничий календар ${Y}`, path: `/kalendar/${Y}` },
          ]}
        />
        <JsonLd data={faqLd(FAQ)} />
        <div className="container">
          <nav className="crumbs">
            <Link href="/">Головна</Link> › <Link href="/kalendar">Виробничий календар</Link> › {Y}
          </nav>
          <h1 className="page-h1">Виробничий календар {Y}</h1>
          <p className="sub">
            Робочі, вихідні та святкові дні в Україні на {Y} рік і норма робочого часу по місяцях.
            Базовий графік: понеділок–пʼятниця по 8 годин, без автоматичних святкових вихідних і перенесень.
          </p>

          <section className="cal-summary" aria-labelledby={`robochi-dni-po-misyatsyah-${Y}`}>
            <h2 id={`robochi-dni-po-misyatsyah-${Y}`}>Робочі дні та години по місяцях {Y} року</h2>
            <p id="calendar-basis-2027">Базовий графік: Пн–Пт по 8 годин. Це не індивідуальна норма підприємства, фактичний графік уточнюйте у роботодавця.</p>
            <table aria-describedby="calendar-basis-2027">
              <caption>Кількість робочих днів, вихідних і годин за графіком 5/2 у {Y} році</caption>
              <thead><tr><th scope="col">Місяць</th><th scope="col">Робочі дні</th><th scope="col">Вихідні</th><th scope="col">Години</th></tr></thead>
              <tbody>{MONTH_NAMES.map((name, m) => {
                const ms = monthStats(m, Y);
                return <tr key={m}><th scope="row"><a href={`#${MONTH_SLUGS[m]}-${Y}`}>{name}</a></th><td>{ms.work}</td><td>{ms.off}</td><td>{ms.hours}</td></tr>;
              })}</tbody>
            </table>
          </section>

          <div className="cal-stats">
            <div className="cal-stat"><b>{stats.work}</b><span>робочих днів</span></div>
            <div className="cal-stat"><b>{stats.off}</b><span>вихідних за графіком 5/2</span></div>
            <div className="cal-stat"><b>{stats.holidays}</b><span>святкових дат</span></div>
            <div className="cal-stat"><b>{stats.work * HOURS_PER_DAY}</b><span>робочих годин за рік</span></div>
          </div>

          <CalendarGrid year={Y} />

          <div className="seo-text">
            <h2 id={`svyata-${Y}`}>Святкові дні {Y} року</h2>
            <ul>
              {holidays.map((h) => (
                <li key={h.iso}>{h.label} ({h.dow}): {h.name}</li>
              ))}
            </ul>
            <p>
              Перелік взято зі статті 73 КЗпП. {onWeekend.length} дат припадають на суботу або неділю:{" "}
              {onWeekend.map((h) => h.label).join(", ")}.
            </p>

            <h2 id={`traven-${Y}`}>Травень {Y}: {workDaysLabel(may.work)}, {may.hours} годин</h2>
            <p>
              У травні {Y} три святкові дати: 1 травня, 2 травня (Великдень) і 8 травня. Усі вони
              випадають на вихідні, тому за графіком 5/2 травень має {workDaysLabel(may.work)} незалежно від свят.
              Без воєнного стану стаття 67 КЗпП переносила б вихідні на 3, 4 і 10 травня.
            </p>

            <h2 id={`yak-rahuyemo-${Y}`}>Як ми рахуємо робочі дні та години</h2>
            <p>
              Розрахунок охоплює всі понеділки–пʼятниці {Y} року; суботи й неділі враховані як вихідні.
              Святкові дати показані довідково і не віднімаються від робочих днів. Під час воєнного стану
              стаття 73 та перенесення вихідних за статтею 67 КЗпП не застосовуються згідно з частиною 6
              статті 6 Закону № 2136-IX. Станом на 25 листопада 2026 року воєнний стан продовжено до
              29 січня 2027 року. Якщо правовий режим зміниться, графік потрібно переглянути.
            </p>
            <p>
              Години розраховані для 40-годинного тижня по {HOURS_PER_DAY} годин на день. Для 36-годинного
              тижня норму беріть із графіка вашого підприємства.
            </p>
          </div>

          <p style={{ color: "var(--muted2)", fontSize: 14, marginTop: 12 }}>
            * Довідково. Позначення свята не означає вихідного. Джерела:{" "}
            <a href="https://zakon.rada.gov.ua/laws/show/322-08#Text" target="_blank" rel="noopener noreferrer">стаття 73 КЗпП</a>{" "}
            і <a href="https://zakon.rada.gov.ua/laws/show/2136-20#Text" target="_blank" rel="noopener noreferrer">стаття 6 Закону № 2136-IX</a>.
          </p>

          <section className="faq-block">
            <h2 className="title" style={{ fontSize: 24 }}>Часті запитання про виробничий календар {Y}</h2>
            {FAQ.map((f, i) => (
              <details key={i} className="faq-item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </section>

          <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 24 }}>
            Також на сайті: <Link href="/kalendar">календар 2026</Link> ·{" "}
            <Link href="/zarplatomir">зарплатомір Сміли</Link> ·{" "}
            <Link href="/vakansii">усі вакансії Сміли</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
