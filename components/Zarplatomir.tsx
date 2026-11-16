"use client";
import { useState } from "react";
import Link from "next/link";
import { CATEGORIES, salaryFmt, type Vacancy } from "@/lib/data";

const MAX_VISIBLE_OFFERS = 5;

type SalaryOffer = Pick<Vacancy, "id" | "title" | "company" | "cat" | "salary">;

export default function Zarplatomir({ vacancies }: { vacancies: SalaryOffer[] }) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const offers = vacancies.filter((v) => v.cat === category.slug);
  const visibleOffers = offers.slice(0, MAX_VISIBLE_OFFERS);

  return (
    <div className="zp">
      <label htmlFor="salary-category" style={{ fontWeight: 700, color: "var(--ink2)", display: "block", marginBottom: 8 }}>
        Оберіть напрямок роботи:
      </label>
      <select id="salary-category" value={category.slug} onChange={(event) => {
        const next = CATEGORIES.find((item) => item.slug === event.target.value);
        if (next) setCategory(next);
      }}>
        {CATEGORIES.map((item) => (
          <option key={item.slug} value={item.slug}>
            {item.ico} {item.name}
          </option>
        ))}
      </select>

      <div className="result" style={{ textAlign: "left" }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>{category.name}</h2>
        {visibleOffers.length ? (
          <>
            <p className="lbl" style={{ margin: 0, color: "var(--ink)" }}>
              Показано {visibleOffers.length} із {offers.length} оголошень із зазначеною оплатою.
              Період оплати, базову ставку й доплати уточнюйте в оголошенні або в роботодавця.
            </p>
            <ul style={{ margin: "12px 0 0", paddingInlineStart: 20, overflowWrap: "anywhere" }}>
              {visibleOffers.map((vacancy) => (
                <li key={vacancy.id} style={{ marginBlock: 8 }}>
                  <Link href={`/vakansiya/${vacancy.id}`} style={{ textDecoration: "underline", color: "var(--ink)" }}>
                    {vacancy.title}
                  </Link>
                  <br />
                  <span className="lbl" style={{ color: "var(--ink)" }}>{vacancy.company} · </span><strong>{salaryFmt(vacancy.salary)}</strong>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="lbl" style={{ margin: 0, color: "var(--ink)" }}>Немає вакансій із зазначеною оплатою за цим напрямком.</p>
        )}
        <Link href={`/vakansii/${category.slug}`} className="btn" style={{ marginTop: 18 }}>
          Усі вакансії напряму →
        </Link>
      </div>
    </div>
  );
}
