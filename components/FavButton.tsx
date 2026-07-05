"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";

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
    <motion.button
      className={"fav" + (on ? " on" : "")}
      aria-label="Зберегти вакансію"
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 1.35 }}
      transition={{ type: "spring", stiffness: 250, damping: 13 }}
      onClick={(e) => {
        e.preventDefault();
        const cur = getFavorites();
        const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
        localStorage.setItem(KEY, JSON.stringify(next));
        setOn(next.includes(id));
      }}
    >
      {on ? "♥" : "♡"}
    </motion.button>
  );
}
