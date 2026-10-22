const KEY = "rs_favorites";
const EVENT = "rs_favorites_changed";

export function getFavorites(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(value) ? value.filter((id): id is number => Number.isSafeInteger(id)) : [];
  } catch { return []; }
}

export function toggleFavorite(id: number): void {
  const current = getFavorites();
  const next = current.includes(id) ? current.filter((value) => value !== id) : [...current, id];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  } catch { /* Storage can be unavailable in restricted browser modes. */ }
}

export function subscribeFavorites(update: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) update();
  };
  window.addEventListener(EVENT, update);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, update);
    window.removeEventListener("storage", onStorage);
  };
}
