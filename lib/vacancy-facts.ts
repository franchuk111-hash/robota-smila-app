import type { Vacancy } from './data';
import { inferRequiredExperience } from './vacancy-experience';

export function experienceStatus(v: Vacancy): 'required' | 'not-required' | 'unknown' {
  const inferred = inferRequiredExperience([v.short, ...v.req, ...v.duties, ...v.offer].join('\n'));
  return inferred === true ? 'required' : inferred === false ? 'not-required' : 'unknown';
}

export function experienceLabel(v: Vacancy): string {
  const status = experienceStatus(v);
  return status === 'required' ? 'Потрібен досвід' : status === 'not-required' ? 'Без обов’язкового досвіду' : 'Досвід: уточнюйте в оголошенні';
}

// A portal's search city does not establish the actual workplace.
export function vacancyLocation(v: Vacancy): string {
  const text = [v.short, ...v.duties].join(' ');
  if (/Канівськ/i.test(text)) return 'Канівський район';
  if (/(?:м[. ]+Сміла|у\s+Смілі|в\s+Смілі|міст[ао]\s+Сміла|ТГ,\s*Сміла)/iu.test(text)) return v.district && v.district !== 'Сміла' ? `Сміла, ${v.district}` : 'Сміла';
  return 'Місце роботи: уточнюйте в оголошенні';
}

export function canPublishJobPosting(v: Vacancy): boolean {
  return Boolean(v.sourceUrl) && /^(?:Сміла)(?:,|$)/u.test(vacancyLocation(v));
}

export function salaryStatistics(list: Vacancy[]) {
  const paid = list.filter(v => v.salary[0] > 0 || v.salary[1] > 0);
  if (!paid.length) return null;
  const avgMin = Math.round(paid.reduce((sum, v) => sum + v.salary[0], 0) / paid.length);
  const avgMax = Math.round(paid.reduce((sum, v) => sum + v.salary[1], 0) / paid.length);
  return { count: paid.length, avgMin, avgMax, mid: Math.round((avgMin + avgMax) / 2) };
}
