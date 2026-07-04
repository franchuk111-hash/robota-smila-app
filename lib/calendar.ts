// Виробничий календар України на 2026 рік
export const YEAR = 2026;

// Офіційні неробочі свята України 2026 (після реформи 2023 р.)
export const HOLIDAYS: Record<string, string> = {
  "2026-01-01": "Новий рік",
  "2026-03-08": "Міжнародний жіночий день",
  "2026-04-12": "Великдень (Пасха)",
  "2026-05-01": "День праці",
  "2026-05-09": "День перемоги над нацизмом у Другій світовій війні",
  "2026-05-31": "Трійця",
  "2026-06-28": "День Конституції України",
  "2026-08-24": "День Незалежності України",
  "2026-10-01": "День захисників і захисниць України",
  "2026-12-25": "Різдво Христове",
};

export const MONTH_NAMES = [
  "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
  "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень",
];

export const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

export type Day = { day: number; iso: string; weekend: boolean; holiday?: string };

export function buildMonth(month: number): (Day | null)[] {
  const first = new Date(Date.UTC(YEAR, month, 1));
  const daysInMonth = new Date(Date.UTC(YEAR, month + 1, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7; // Пн = 0
  const cells: (Day | null)[] = Array(lead).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(Date.UTC(YEAR, month, d)).getUTCDay();
    const iso = `${YEAR}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ day: d, iso, weekend: dow === 0 || dow === 6, holiday: HOLIDAYS[iso] });
  }
  return cells;
}

export function yearStats() {
  let work = 0;
  let off = 0;
  for (let m = 0; m < 12; m++) {
    for (const c of buildMonth(m)) {
      if (!c) continue;
      if (c.weekend || c.holiday) off++;
      else work++;
    }
  }
  return { work, off, holidays: Object.keys(HOLIDAYS).length };
}
