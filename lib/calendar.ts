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

// Слуги для якірних посилань на місяць (напр. /kalendar#zhovten-2026)
export const MONTH_SLUGS = [
  "sichen", "lyutyi", "berezen", "kviten", "traven", "cherven",
  "lypen", "serpen", "veresen", "zhovten", "lystopad", "hruden",
];

// Родовий відмінок для дат: «1 січня», «25 грудня»
export const MONTH_GENITIVE = [
  "січня", "лютого", "березня", "квітня", "травня", "червня",
  "липня", "серпня", "вересня", "жовтня", "листопада", "грудня",
];

// Робочі години за 40-годинним тижнем (5 днів × 8 годин)
export const HOURS_PER_DAY = 8;

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

// Статистика одного місяця: робочі дні, вихідні/святкові, норми годин.
export function monthStats(month: number) {
  let work = 0;
  let off = 0;
  const holidays: { day: number; name: string; onWeekend: boolean }[] = [];
  for (const c of buildMonth(month)) {
    if (!c) continue;
    if (c.weekend || c.holiday) {
      off++;
      if (c.holiday) {
        holidays.push({ day: c.day, name: c.holiday, onWeekend: c.weekend });
      }
    } else {
      work++;
    }
  }
  return { work, off, holidays, days: work + off, hours: work * HOURS_PER_DAY };
}

// Українські відмінки для кількості робочих днів: 21 → «21 робочий день».
export function workDaysLabel(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} робочий день`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} робочі дні`;
  return `${n} робочих днів`;
}
