"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { Vacancy, salaryFmt, dateFmt } from "@/lib/data";
import FavButton from "./FavButton";

export default function VacCard({ v }: { v: Vacancy }) {
  return (
    <motion.article
      className={"vac" + (v.hot ? " hot" : "")}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
    >
      <FavButton id={v.id} />
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
        <Link className="btn" href={`/vakansiya/${v.id}`}>
          Відгукнутися
        </Link>
      </div>
    </motion.article>
  );
}
