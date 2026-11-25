import { MONTH_NAMES, MONTH_SLUGS, WEEKDAYS, buildMonth, monthStats, workDaysLabel } from "@/lib/calendar";

export default function CalendarGrid({ year }: { year: number }) {
  return (
    <div className="cal-grid">
      {MONTH_NAMES.map((name, m) => {
        const ms = monthStats(m, year);
        return (
          <div className="cal-month" id={`${MONTH_SLUGS[m]}-${year}`} key={m}>
            <h3>{name}</h3>
            <div className="cal-week">
              {WEEKDAYS.map((w) => (
                <span key={w} className="cal-wd">
                  {w}
                </span>
              ))}
            </div>
            <div className="cal-days">
              {buildMonth(m, year).map((c, i) =>
                c ? (
                  <span
                    key={i}
                    className={"cal-day" + (c.holiday ? " holiday" : c.weekend ? " weekend" : "")}
                    title={c.holiday || undefined}
                  >
                    {c.day}
                  </span>
                ) : (
                  <span key={i} className="cal-day empty" />
                )
              )}
            </div>
            <div style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", marginTop: 10 }}>
              {workDaysLabel(ms.work)} · {ms.hours} год
            </div>
          </div>
        );
      })}
    </div>
  );
}
