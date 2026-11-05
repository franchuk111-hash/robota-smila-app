// Standard employee salary only: no relief, special regime or other deductions.
// Rates checked against the State Tax Service on 2026-11-05.
export const PAYROLL_RATES = { income: 0.18, military: 0.05 } as const;
export function payroll(amount: number, direction: 'gross' | 'net' = 'gross') {
  if (!Number.isFinite(amount) || amount < 0 || amount > 10_000_000) return null;
  const gross = direction === 'gross' ? Math.round(amount * 100) : Math.round(amount * 100 / 0.77);
  const income = Math.round(gross * PAYROLL_RATES.income);
  const military = Math.round(gross * PAYROLL_RATES.military);
  return { gross: gross / 100, income: income / 100, military: military / 100, net: (gross - income - military) / 100 };
}
