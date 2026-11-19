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

// Work.ua search results may include nearby cities. These workplaces were checked
// against the original listings on 2026-11-19; use a checked field only for the listed role, employer and publication date.
type Workplace = 'Сміла' | 'Черкаси' | 'Балаклея' | 'Канівський район';
const checkedWorkplaces = new Map<string, [title: string, company: string, date: string, workplace: Workplace]>([
  ['https://www.work.ua/jobs/7260322/', ['Охоронник', 'Вересень плюс, ТОВ', '2026-11-17', 'Черкаси']],
  ['https://www.work.ua/jobs/6086982/', ['Бухгалтер з заробітної плати', 'Агро-Рось', '2026-11-13', 'Балаклея']],
  ['https://www.work.ua/jobs/8591071/', ['Продавець-консультант', 'COMFY', '2026-11-16', 'Сміла']],
  ['https://www.work.ua/jobs/6539155/', ['Лікар УЗД', 'Максімед Плюс, ПП', '2026-11-08', 'Сміла']],
]);

export function workplace(v: Vacancy): Workplace | undefined {
  if (!v.sourceUrl) return;
  const text = [v.short, ...v.duties, ...v.req, ...v.offer].join(' ');
  if (/Місце знаходження\s*:\s*Черкаська обл\.,\s*Смілянський р-н,\s*с[.\s]+Балаклея(?![\p{L}-])/iu.test(text)) return 'Балаклея';
  if (/Робота проводиться на будівельній площадці у Канівському районі/iu.test(text)) return 'Канівський район';
  if (v.source === 'dcz' && /Смілянська міська ТГ,\s*Сміла(?![\p{L}-])/iu.test(text)) return 'Сміла';
  if (/(?:Локація|Місце роботи)\s*:\s*(?:м\.\s*)?Сміла(?![\p{L}-])/iu.test(text)) return 'Сміла';
  const verified = checkedWorkplaces.get(v.sourceUrl);
  if (verified && verified[0] === v.title && verified[1] === v.company && verified[2] === v.date &&
      !/(?:Локація|Місце роботи|Місце знаходження)\s*:/iu.test(text)) return verified[3];
}

export function vacancyLocation(v: Vacancy): string {
  return workplace(v) ?? 'Місце роботи: уточнюйте в оголошенні';
}

export function canPublishJobPosting(v: Vacancy): boolean {
  const locality = workplace(v);
  return Boolean(locality && locality !== 'Канівський район');
}

export function salaryStatistics(list: Vacancy[]) {
  const paid = list.filter(v => v.salary[0] > 0 || v.salary[1] > 0);
  if (!paid.length) return null;
  const avgMin = Math.round(paid.reduce((sum, v) => sum + v.salary[0], 0) / paid.length);
  const avgMax = Math.round(paid.reduce((sum, v) => sum + v.salary[1], 0) / paid.length);
  return { count: paid.length, avgMin, avgMax, mid: Math.round((avgMin + avgMax) / 2) };
}

// Only an explicit positive statement in the source; never infer legal eligibility.
export function mentionsBooking(v: Vacancy): boolean {
  return [v.short, ...v.duties, ...v.req, ...v.offer].some(part =>
    part.split(/[.!?;\n]/u).some(sentence =>
      /(?:можливість|наявність|надаємо|забезпечуємо|пропонуємо)\s+бронювання/iu.test(sentence) &&
      !/(?:не\s+(?:надаємо|забезпечуємо|пропонуємо)|без\s+бронювання|немає|відсутн|неможлив|не\s+передбач|не\s+надається|недоступн|бронювання\s*:\s*ні(?:\s|$)|бронювання\s+(?:квитків|готел|номерів|місць))/iu.test(sentence)
    )
  );
}

// A lower bound, rather than an advertised upper limit, meets a salary threshold.
export function meetsSalaryMinimum(v: Vacancy, minimum: number): boolean {
  return minimum <= 0 || (v.salary[0] > 0 && v.salary[0] >= minimum);
}
