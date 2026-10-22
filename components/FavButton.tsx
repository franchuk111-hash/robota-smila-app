"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";

import { getFavorites, subscribeFavorites, toggleFavorite } from "@/lib/favorites";
export { getFavorites } from "@/lib/favorites";

export default function FavButton({ id }: { id: number }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const update = () => setOn(getFavorites().includes(id));
    update();
    return subscribeFavorites(update);
  }, [id]);

  return (
    <motion.button
      className={"fav" + (on ? " on" : "")}
      aria-label={on ? "Видалити зі збережених" : "Зберегти вакансію"}
      aria-pressed={on}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 1.35 }}
      transition={{ type: "spring", stiffness: 250, damping: 13 }}
      onClick={(e) => {
        e.preventDefault();
        toggleFavorite(id);
      }}
    >
      {on ? "♥" : "♡"}
    </motion.button>
  );
}
