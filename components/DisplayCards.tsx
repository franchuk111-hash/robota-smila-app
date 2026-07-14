"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { VACANCIES, salaryFmt, CATEGORIES, type Vacancy } from "@/lib/data";

const ease = [0.22, 1, 0.36, 1] as const;

function ico(cat: string) {
  return CATEGORIES.find((c) => c.slug === cat)?.ico ?? "💼";
}

function Card({ v, pos }: { v: Vacancy; pos: 1 | 2 | 3 }) {
  return (
    <Link href={`/vakansiya/${v.id}`} className={`deck-card c${pos}`}>
      <div className="dc-head">
        <span className="dc-ico">{ico(v.cat)}</span>
        <span className="dc-title">{v.title}</span>
      </div>
      <div className="dc-sal">{salaryFmt(v.salary)}</div>
      <div className="dc-meta">
        {v.company} · {v.district}
      </div>
    </Link>
  );
}

// Колода з 3 гарячих вакансій із «display cards» ефектом (скіс + розсув на ховері).
export default function DisplayCards() {
  const hot = VACANCIES.filter((v) => v.hot);
  const vgb = hot.find((v) => v.company === "V.G.BuildingTeam");
  const rest = hot
    .filter((v) => v.id !== vgb?.id)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const picks = [vgb, rest[0], rest[1]].filter(Boolean).slice(0, 3) as Vacancy[];
  if (picks.length < 3) return null;

  return (
    <motion.div
      className="hero-deck"
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.7, ease }}
      aria-hidden={false}
    >
      <div className="deck">
        <Card v={picks[0]} pos={1} />
        <Card v={picks[1]} pos={2} />
        <Card v={picks[2]} pos={3} />
      </div>
    </motion.div>
  );
}
