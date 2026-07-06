// Операціоналізація етапів 7-9-11 pipeline (структурування, категорія,
// публікація): безпечно додає нову вакансію в lib/data.ts без ризику
// зламати синтаксис TS вручну.
//
// Використання:
//   1. Створи JSON-файл за зразком scripts/vacancy.example.json
//   2. npm run add-vacancy -- шлях/до/файлу.json
//   3. Перевір git diff lib/data.ts
//   4. npm run build && npm run deploy
import fs from "fs";
import path from "path";
import { VACANCIES, CATEGORIES } from "../lib/data";

type Input = {
  title: string;
  company: string;
  salary: [number, number];
  cat: string;
  type: "FULL_TIME" | "PART_TIME" | "SHIFT";
  schedule: string;
  district: string;
  exp: boolean;
  short: string;
  duties: string[];
  req: string[];
  offer: string[];
  slug?: string;
  date?: string;
  hot?: boolean;
  paymentFrequency?: "daily" | "weekly" | "monthly";
};

const TYPE_NAMES: Record<Input["type"], string> = {
  FULL_TIME: "Повна зайнятість",
  PART_TIME: "Часткова зайнятість",
  SHIFT: "Змінний графік",
};

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ye", ж: "zh",
  з: "z", и: "y", і: "i", ї: "yi", й: "y", к: "k", л: "l", м: "m", н: "n",
  о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
  ч: "ch", ш: "sh", щ: "shch", ь: "", ю: "yu", я: "ya", "'": "", "’": "",
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .split("")
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fail(msg: string): never {
  console.error("❌ " + msg);
  process.exit(1);
}

const filePath = process.argv[2];
if (!filePath) {
  fail(
    "Вкажи шлях до JSON-файлу з вакансією.\nПриклад: npm run add-vacancy -- scripts/vacancy.example.json"
  );
}

const raw = fs.readFileSync(path.resolve(filePath), "utf-8");
const input = JSON.parse(raw) as Input;

const required: (keyof Input)[] = [
  "title", "company", "salary", "cat", "type", "schedule",
  "district", "short", "duties", "req", "offer",
];
for (const field of required) {
  if (input[field] === undefined || input[field] === null) {
    fail(`Не вказано обов'язкове поле "${field}"`);
  }
}
if (input.exp === undefined) {
  fail('Не вказано поле "exp" (true/false) — досвід потрібен чи ні');
}

const category = CATEGORIES.find((c) => c.slug === input.cat);
if (!category) {
  fail(
    `Категорія "${input.cat}" не існує. Доступні: ${CATEGORIES.map((c) => c.slug).join(", ")}`
  );
}

const nextId = Math.max(...VACANCIES.map((v) => v.id)) + 1;
const slug = input.slug || slugify(input.title);
const date = input.date || new Date().toISOString().slice(0, 10);

const esc = (s: string) => s.replace(/"/g, '\\"');
const arr = (a: string[]) => `[${a.map((s) => `"${esc(s)}"`).join(", ")}]`;

const fields = [
  `id: ${nextId}`,
  input.hot ? "hot: true" : null,
  `slug: "${esc(slug)}"`,
  `title: "${esc(input.title)}"`,
  `company: "${esc(input.company)}"`,
  `salary: [${input.salary[0]}, ${input.salary[1]}]`,
  `cat: "${input.cat}"`,
  `catName: "${esc(category.name)}"`,
  `type: "${input.type}"`,
  `typeName: "${TYPE_NAMES[input.type]}"`,
  `schedule: "${esc(input.schedule)}"`,
  `district: "${esc(input.district)}"`,
  `exp: ${input.exp}`,
  `date: "${date}"`,
  input.paymentFrequency ? `paymentFrequency: "${input.paymentFrequency}"` : null,
  `short: "${esc(input.short)}"`,
  `duties: ${arr(input.duties)}`,
  `req: ${arr(input.req)}`,
  `offer: ${arr(input.offer)}`,
]
  .filter(Boolean)
  .join(", ");

const newLine = `  { ${fields} },\n];`;

const dataPath = path.resolve(__dirname, "../lib/data.ts");
const source = fs.readFileSync(dataPath, "utf-8");
const marker = "\n];\n\nexport const COMPANIES";
if (!source.includes(marker)) {
  fail("Не вдалося знайти кінець масиву VACANCIES у lib/data.ts — файл змінено вручну?");
}
const updated = source.replace(
  "\n];\n\nexport const COMPANIES",
  `\n${newLine}\n\nexport const COMPANIES`
);
fs.writeFileSync(dataPath, updated, "utf-8");

console.log(`✅ Додано вакансію #${nextId} "${input.title}" (${category.name})`);
console.log(`   slug: ${slug}`);
console.log(`   Перевір: git diff lib/data.ts`);
console.log(`   Потім: npm run build && npm run deploy`);
