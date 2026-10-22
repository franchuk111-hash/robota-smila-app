"use client";
import { experienceLabel, experienceStatus, vacancyLocation } from "@/lib/vacancy-facts";
import Link from "next/link";
import { motion } from "motion/react";
import { Vacancy, salaryFmt, dateFmt, vacancyTgLink } from "@/lib/data";
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
    trackEvent(GA4_EVENTS.TELEGRAM_SUBSCRIBE, {
      source: "vacancy_card",
      vacancy_id: v.id,
      vacancy_title: v.title,
      category: v.cat,
      channel: "telegram",
    });
  };

  return (
    <motion.article
      className={"vac vac-readable" + (v.hot ? " hot" : "")}
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
      <div className="company">
        <span className="co-ico" aria-hidden="true">{v.company.trim().slice(0, 1).toLocaleUpperCase("uk-UA")}</span>
        {v.company}
      </div>
      <div className={"salary" + (v.salary.every(amount => amount === 0) ? " salary-negotiable" : "")}>
        {v.salary.every(amount => amount === 0) ? "Оплата за домовленістю" : salaryFmt(v.salary)}
      </div>
      <div className="vac-conditions">
        <div><span aria-hidden="true">⌖</span>{vacancyLocation(v)}</div>
        <div><span aria-hidden="true">◷</span>{[v.schedule, v.typeName].filter((value, index, all) => value && all.findIndex(other => other.toLocaleLowerCase() === value.toLocaleLowerCase()) === index).join(" · ")}</div>
        {experienceStatus(v) !== "unknown" && <div><span aria-hidden="true">✓</span>{experienceLabel(v)}</div>}
      </div>
      {v.short && <p className="vac-excerpt">{v.short}</p>}
      <div className="apply">
        <span className="date">{dateFmt(v.date)}</span>
        <div className="vac-actions">
        <Link className="btn vac-details" href={`/vakansiya/${v.id}`}>Детальніше</Link>
        <SpringLink className="btn vac-telegram" href={vacancyTgLink(v)} onClick={handleApply} external>
          {v.tgMsgId ? "Telegram ↗" : "Канал Telegram ↗"}
        </SpringLink>
        </div>
      </div>
    </motion.article>
  );
}
