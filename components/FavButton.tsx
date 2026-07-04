"use client";
import { useEffect, useState } from "react";

const KEY = "rs_favorites";

export function getFavorites(): number[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export default function FavButton({ id }: { id: number }) {
  const [on, setOn] = useState(false);
  useEffect(() => setOn(getFavorites().includes(id)), [id]);

  return (
    <button
      className={"fav" + (on ? " on" : "")}
      aria-label="Зберегти вакансію"
      onClick={(e) => {
        e.preventDefault();
        const cur = getFavorites();
        const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
        localStorage.setItem(KEY, JSON.stringify(next));
        setOn(next.includes(id));
      }}
    >
      {on ? "♥" : "♡"}
    </button>
  );
}
