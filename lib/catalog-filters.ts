export const EMPLOYMENT_FILTERS = ["FULL_TIME", "PART_TIME", "SHIFT"] as const;

export function readCatalogFilters(params: URLSearchParams, categorySlugs: string[]) {
  const allowed = new Set(categorySlugs);
  return {
    query: params.get("q") || "",
    cats: new Set(params.getAll("cat").filter((value) => allowed.has(value))),
    types: new Set(params.getAll("type").filter((value) => EMPLOYMENT_FILTERS.some((type) => type === value))),
    exp: ["1", "true"].includes(params.get("exp") || ""),
  };
}

export function writeCatalogFilters(params: URLSearchParams, key: "q" | "cat" | "type" | "exp", values: string[]) {
  const next = new URLSearchParams(params);
  next.delete(key);
  for (const value of values) if (value) next.append(key, value);
  return next;
}
