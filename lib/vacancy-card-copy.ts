import type { Vacancy } from './data';

// Presentation only: retain the original source facts for details and imports.
export function cardEmployment(v: Pick<Vacancy, 'typeName' | 'schedule'>): string {
  const key = (value: string) => value.toLocaleLowerCase('uk-UA').replace(/[.!]+$/u, '').trim();
  const aliases: Record<string, string> = {
    'повна': 'повна зайнятість',
    'неповна зайнятість': 'часткова зайнятість',
    'часткова': 'часткова зайнятість',
  };
  const normalize = (value: string) => aliases[key(value)] ?? key(value);
  const parts = [v.typeName];
  // Employment lists precede candidate eligibility; keep complete eligibility intact.
  const [employment, ...eligibility] = v.schedule.trim().split(/\.\s*(?=Також готові взяти)/iu);
  for (const value of employment.split(/[,·]/u).map(s => s.trim()).filter(Boolean)) {
    if (!parts.some(part => normalize(part) === normalize(value))) parts.push(value);
  }
  for (const value of eligibility) {
    if (!/^Також готові взяти[.!\s]*$/iu.test(value)) parts.push(value);
  }
  return parts.filter(Boolean).join(' · ');
}
