import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  YEAR,
  MONTH_NAMES,
  WEEKDAYS,
  HOLIDAYS,
  buildMonth,
  yearStats,
} from "@/lib/calendar";

export const metadata: Metadata = {
  title: "Виробничий календар 2026 — робочі та святкові дні (Україна)",
  description:
    "Виробничий календар України на 2026 рік: робочі, вихідні та святкові дні, кількість робочих днів. Зручно для розрахунку відпусток і зарплат у Смілі.",
  alternates: { canonical: "/kalendar" },
};

export default function CalendarPage() {
  const stats = yearStats();
  return (
    <>
      <Header />
      <div className="container">
        <nav className="crumbs">
          <Link href="/">Головна</Link> › Виробничий календар
        </nav>
        <h1 className="page-h1">Виробничий календар {YEAR}</h1>
        <p className="sub">Робочі, вихідні та святкові дні в Україні на {YEAR} рік</p>

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
        </div>

        <div className="cal-grid">
          {MONTH_NAMES.map((name, m) => (
            <div className="cal-month" key={m}>
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
            </div>
          ))}
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
          * Довідково. В умовах воєнного стану перенесення вихідних може не діяти.
        </p>
      </div>
      <Footer />
    </>
  );
}
