export const EMPLOYMENT_FILTERS = ["FULL_TIME", "PART_TIME", "SHIFT"] as const;

export type CatalogFilterKey = "q" | "cat" | "type" | "exp" | "min_salary" | "booking";

export function readCatalogFilters(params: URLSearchParams, categorySlugs: string[]) {
  const allowed = new Set(categorySlugs);
  return {
    query: params.get("q") || "",
    minSalary: /^\d{1,7}$/.test(params.get("min_salary") || "") ? Number(params.get("min_salary")) : 0,
    booking: params.get("booking") === "1",
    cats: new Set(params.getAll("cat").filter((value) => allowed.has(value))),
    types: new Set(params.getAll("type").filter((value) => EMPLOYMENT_FILTERS.some((type) => type === value))),
    exp: ["1", "true"].includes(params.get("exp") || ""),
  };
}

export function writeCatalogFilters(params: URLSearchParams, key: CatalogFilterKey, values: string[]) {
  const next = new URLSearchParams(params);
  next.delete(key);
  for (const value of values) if (value) next.append(key, value);
  return next;
}
