import fs from 'node:fs';
import path from 'node:path';
import { ALL_VACANCIES, CATEGORIES, type Vacancy } from '../lib/data';

type Input = Omit<Vacancy, 'id' | 'catName' | 'typeName' | 'slug' | 'date'> & { slug?: string; date?: string };
const names = { FULL_TIME: 'Повна зайнятість', PART_TIME: 'Часткова зайнятість', SHIFT: 'Змінний графік' };
const letters: Record<string, string> = { а:'a',б:'b',в:'v',г:'h',ґ:'g',д:'d',е:'e',є:'ye',ж:'zh',з:'z',и:'y',і:'i',ї:'yi',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',ч:'ch',ш:'sh',щ:'shch',ь:'',ю:'yu',я:'ya' };
const slugify = (value: string) => [...value.toLowerCase()].map(c => letters[c] ?? c).join('').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function prepareManualVacancies(values: unknown, existing: Vacancy[], now = new Date()): Vacancy[] {
  if (!Array.isArray(values) || !values.length) throw new Error('Очікується непорожній масив вакансій');
  const result = [...existing];
  let id = Math.max(1023, ...existing.map(v => v.id)) + 1;
  for (const raw of values) {
    if (!raw || typeof raw !== 'object') throw new Error('Некоректна вакансія');
    const v = raw as Input;
    for (const key of ['title', 'company', 'cat', 'type', 'schedule', 'district', 'short'] as const) {
      if (typeof v[key] !== 'string' || !v[key].trim()) throw new Error(`Некоректне поле ${key}`);
    }
    if (typeof v.exp !== 'boolean') throw new Error('exp має бути true/false');
    for (const key of ['duties', 'req', 'offer'] as const) {
      if (!Array.isArray(v[key]) || !v[key].every(x => typeof x === 'string')) throw new Error(`Некоректне поле ${key}`);
    }
    if (!Array.isArray(v.salary) || v.salary.length !== 2 || !v.salary.every(n => Number.isFinite(n) && n >= 0) || v.salary[0] > v.salary[1]) throw new Error('Некоректний діапазон зарплати');
    const category = CATEGORIES.find(c => c.slug === v.cat);
    if (!category || !Object.hasOwn(names, v.type)) throw new Error('Некоректна категорія або тип зайнятості');
    const slug = v.slug ?? slugify(v.title);
    if (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || result.some(x => x.slug === slug)) throw new Error('Некоректний або повторний slug');
    const date = v.date ?? now.toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date || Date.parse(date) > now.getTime()) throw new Error('Некоректна дата публікації');
    if (v.validThrough && (!Number.isFinite(Date.parse(v.validThrough)) || Date.parse(v.validThrough) <= Date.parse(date))) throw new Error('Некоректний термін дії');
    result.push({ ...v, id: id++, slug, date, catName: category.name, typeName: names[v.type] });
  }
  return result.slice(existing.length);
}

export function addManualVacancies(values: unknown): void {
  const file = path.resolve('data/manual-vacancies.json');
  const manual: Vacancy[] = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
  const added = prepareManualVacancies(values, [...ALL_VACANCIES, ...manual]);
  const temporary = `${file}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify([...manual, ...added], null, 2)}\n`);
  fs.renameSync(temporary, file);
  console.log(`Додано ${added.length} вакансій до data/manual-vacancies.json`);
}
