"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { Vacancy, salaryFmt, dateFmt } from "@/lib/data";
import { trackEvent, GA4_EVENTS } from "@/lib/ga4";
import FavButton from "./FavButton";
import ShareButton from "./ShareButton";
import { SpringLink } from "./SpringButton";

export default function VacCard({ v, noReveal = false }: { v: Vacancy; noReveal?: boolean }) {
  const reveal = noReveal
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-40px" },
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
      };

  const handleApply = () => {
    trackEvent(GA4_EVENTS.APPLY_VACANCY, {
      vacancy_id: v.id,
      vacancy_title: v.title,
      category: v.cat,
    });
  };

  return (
    <motion.article
      className={"vac" + (v.hot ? " hot" : "")}
      {...reveal}
      whileHover={{ y: -4 }}
    >
      <FavButton id={v.id} />
      <ShareButton title={v.title} url={`/vakansiya/${v.id}`} />
      {v.hot && (
        <span className="hot-badge">
          <span className="flame">🔥</span> Гаряча
        </span>
      )}
      <h3>
        <Link href={`/vakansiya/${v.id}`}>{v.title}</Link>
      </h3>
      <div className="salary">{salaryFmt(v.salary)}</div>
      <div className="company">
        <span className="co-ico"></span>
        {v.company}
        <span className="verified">✓</span>
      </div>
      <div className="locs">
        Сміла<span className="dot">·</span>
        {v.district}
        <span className="dot">·</span>
        {v.schedule}
      </div>
      <div className="locs dim">
        {v.exp ? "Досвід від 1 року" : "Без досвіду"}
        <span className="dot">·</span>
        {v.typeName}
      </div>
      <div className="apply">
        <span className="date">{dateFmt(v.date)}</span>
        <SpringLink className="btn" href={`/vakansiya/${v.id}`} onClick={handleApply}>
          Відгукнутися
        </SpringLink>
      </div>
    </motion.article>
  );
}
