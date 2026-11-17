import test from "node:test";
import assert from "node:assert/strict";
import { readCatalogFilters, writeCatalogFilters } from "../lib/catalog-filters";

test("catalogue deep links preserve multiple categories, schedules and query", () => {
  const params = new URLSearchParams("q=водій&cat=transport&cat=sales&type=SHIFT&type=PART_TIME&exp=1");
  const state = readCatalogFilters(params, ["transport", "sales"]);
  assert.equal(state.query, "водій");
  assert.deepEqual([...state.cats], ["transport", "sales"]);
  assert.deepEqual([...state.types], ["SHIFT", "PART_TIME"]);
  assert.equal(state.exp, true);
});
test("invalid filters and exp=0 do not silently filter jobs", () => {
  const state = readCatalogFilters(new URLSearchParams("cat=invalid&type=INVALID&exp=0"), ["sales"]);
  assert.equal(state.cats.size + state.types.size, 0);
  assert.equal(state.exp, false);
});
test("changing and clearing filters preserves unrelated attribution", () => {
  let params = writeCatalogFilters(new URLSearchParams("utm_source=telegram&cat=sales&q=old"), "cat", ["transport", "sales"]);
  params = writeCatalogFilters(params, "q", ["швачка & кравець"]);
  assert.equal(params.get("q"), "швачка & кравець");
  assert.deepEqual(params.getAll("cat"), ["transport", "sales"]);
  assert.equal(params.get("utm_source"), "telegram");
  assert.equal(writeCatalogFilters(params, "cat", []).has("cat"), false);
});

test("removing one active condition preserves other conditions and attribution", () => {
  const params = new URLSearchParams("cat=transport&cat=sales&type=SHIFT&exp=1&booking=1&min_salary=20000&q=водій&utm_source=telegram");
  const remainingCategories = writeCatalogFilters(params, "cat", ["sales"]);
  assert.deepEqual(remainingCategories.getAll("cat"), ["sales"]);
  for (const key of ["type", "exp", "booking", "min_salary", "q", "utm_source"]) {
    assert.equal(remainingCategories.get(key), params.get(key));
  }
  for (const key of ["type", "exp", "booking", "min_salary"] as const) {
    const next = writeCatalogFilters(params, key, []);
    assert.equal(next.has(key), false);
    assert.deepEqual(next.getAll("cat"), ["transport", "sales"]);
    assert.equal(next.get("utm_source"), "telegram");
  }
});
