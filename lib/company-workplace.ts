import type { Vacancy } from "./data";
import { workplace } from "./vacancy-facts";

// An employer can advertise in several cities. A common workplace describes the listed roles only.
export function commonWorkplace(vacancies: Vacancy[]) {
  const locations = new Set(vacancies.map(workplace));
  return locations.size === 1 ? locations.values().next().value : undefined;
}
