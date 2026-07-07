// Добавляє масив вакансій з JSON-файлу в lib/data.ts за один раз
// Використання: npm run add-vacancies-batch -- scripts/real-vacancies.json
import fs from "fs";
import path from "path";
import { CATEGORIES } from "../lib/data";

type VacancyInput = {
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

const TYPE_NAMES: Record<VacancyInput["type"], string> = {
  FULL_TIME: "Повна зайнятість",
  PART_TIME: "Часткова зайнятість",
  SHIFT: "Змінний графік",
};

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d", е: "e", є: "ye", ж: "zh",
  з: "z", и: "y", і: "i", ї: "yi", й: "y", к: "k", л: "l", м: "m", н: "n",
  о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts",
  ч: "ch", ш: "sh", щ: "shch", ь: "", ю: "yu", я: "ya", "'": "",
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

const filePath = process.argv[2];
if (!filePath) {
  console.error("❌ Вкажи шлях до JSON-файлу з масивом вакансій.\nПриклад: npm run add-vacancies-batch -- scripts/real-vacancies.json");
  process.exit(1);
}

const raw = fs.readFileSync(path.resolve(filePath), "utf-8");
const vacancies: VacancyInput[] = JSON.parse(raw);

const dataPath = path.resolve(__dirname, "../lib/data.ts");
let source = fs.readFileSync(dataPath, "utf-8");

const marker = "\n];\n\nexport const COMPANIES";
if (!source.includes(marker)) {
  console.error("❌ Не вдалося знайти кінець масиву VACANCIES у lib/data.ts");
  process.exit(1);
}

// Отримай останній ID
const idMatch = source.match(/id: (\d+)/g);
let nextId = 1024;
if (idMatch) {
  const ids = idMatch.map((m) => +m.replace("id: ", ""));
  nextId = Math.max(...ids) + 1;
}

const esc = (s: string) => s.replace(/"/g, '\\"');
const arr = (a: string[]) => `[${a.map((s) => `"${esc(s)}"`).join(", ")}]`;

const newLines = vacancies.map((v) => {
  const category = CATEGORIES.find((c) => c.slug === v.cat);
  if (!category) {
    throw new Error(`Категорія "${v.cat}" не існує`);
  }

  const slug = v.slug || slugify(v.title);
  const date = v.date || new Date().toISOString().slice(0, 10);

  const fields = [
    `id: ${nextId}`,
    v.hot ? "hot: true" : null,
    `slug: "${esc(slug)}"`,
    `title: "${esc(v.title)}"`,
    `company: "${esc(v.company)}"`,
    `salary: [${v.salary[0]}, ${v.salary[1]}]`,
    `cat: "${v.cat}"`,
    `catName: "${esc(category.name)}"`,
    `type: "${v.type}"`,
    `typeName: "${TYPE_NAMES[v.type]}"`,
    `schedule: "${esc(v.schedule)}"`,
    `district: "${esc(v.district)}"`,
    `exp: ${v.exp}`,
    `date: "${date}"`,
    v.paymentFrequency ? `paymentFrequency: "${v.paymentFrequency}"` : null,
    `short: "${esc(v.short)}"`,
    `duties: ${arr(v.duties)}`,
    `req: ${arr(v.req)}`,
    `offer: ${arr(v.offer)}`,
  ]
    .filter(Boolean)
    .join(", ");

  nextId++;
  return `  { ${fields} },`;
});

const insertionPoint = source.indexOf(marker);
source = source.slice(0, insertionPoint) + "\n" + newLines.join("\n") + source.slice(insertionPoint);

fs.writeFileSync(dataPath, source, "utf-8");

console.log(`✅ Додано ${vacancies.length} вакансій до lib/data.ts`);
console.log(`   Перевір: git diff lib/data.ts`);
console.log(`   Потім: npm run build && npm run deploy`);
