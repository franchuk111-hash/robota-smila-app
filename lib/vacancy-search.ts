import type { Vacancy } from "./data";
import { experienceStatus } from "./vacancy-facts";

export function matchesVacancyQuery(vacancy: Vacancy, query: string): boolean {
  const normalized = query.trim().toLocaleLowerCase("uk");
  if (!normalized) return true;
  const noExperience = normalized.includes("без досвіду");
  if (noExperience && experienceStatus(vacancy) !== "not-required") return false;
  const text = noExperience ? normalized.replaceAll("без досвіду", "").trim() : normalized;
  return !text || `${vacancy.title} ${vacancy.company} ${vacancy.short}`.toLocaleLowerCase("uk").includes(text);
}
