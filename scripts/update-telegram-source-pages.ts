import { readdir, writeFile } from "node:fs/promises";
import { ALL_VACANCIES, ARTICLES, CATEGORIES, COMPANIES } from "../lib/data";
async function main() {
  const files = await readdir("app", {recursive:true});
  const staticPages = files.filter(file => file.endsWith("page.tsx") && !file.includes("[")).map(file => file.replace(/\/?page\.tsx$/, "")).filter(Boolean);
  const paths = new Set([
    "home", "unknown", ...staticPages,
    ...ALL_VACANCIES.map(v => `vakansiya/${v.id}`),
    ...COMPANIES.map(v => `kompaniya/${v.slug}`),
    ...CATEGORIES.map(v => `vakansii/${v.slug}`),
    ...ARTICLES.map(v => `blog/${v.slug}`),
  ]);
  await writeFile("lib/telegram-source-pages.json", JSON.stringify([...paths].sort(),null,2)+"\n");
  console.log(`Registered ${paths.size} public Telegram source page paths`);
}
main().catch(error => { console.error(error); process.exitCode=1; });
