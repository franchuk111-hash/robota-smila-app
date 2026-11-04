"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { salaryStatistics } from "@/lib/vacancy-facts";
import { VACANCIES, CATEGORIES, salaryFmt } from "@/lib/data";

export default function Zarplatomir() {
  const [cat, setCat] = useState(CATEGORIES[0].slug);

  const stat = useMemo(() => {
    const list = VACANCIES.filter((v) => v.cat === cat);
    if (!list.length) return null;
    return salaryStatistics(list);
  }, [cat]);

  const f = (n: number) => n.toLocaleString("uk-UA");

  return (
    <div className="zp">
      <label htmlFor="salary-category" style={{ fontWeight: 700, color: "var(--ink2)", display: "block", marginBottom: 8 }}>
        Оберіть напрямок роботи:
      </label>
      <select id="salary-category" value={cat} onChange={(e) => setCat(e.target.value)}>
        {CATEGORIES.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.ico} {c.name}
          </option>
        ))}
      </select>

      {stat ? (
        <div className="result">
          <div className="lbl">Середня зарплата у вибірці</div>
          <div className="big">{f(stat.mid)} ₴</div>
          <div className="lbl" style={{ marginTop: 6 }}>
            {stat.avgMin === stat.avgMax ? "Середня зазначена сума" : "Середні межі зазначеної оплати"}: {salaryFmt([stat.avgMin, stat.avgMax])}
            <br />Оголошень із зазначеною оплатою: {stat.count}
          </div>
          {stat.count < 5 && (
            <p className="lbl" data-nosnippet style={{ marginTop: 12 }}>
              Мала вибірка: {stat.count} оголошення. Одна пропозиція може суттєво змінити показник; порівняйте умови у вакансіях.
            </p>
          )}
          <Link
            href={`/vakansii/${cat}`}
            className="btn"
            style={{ marginTop: 18 }}
          >
            Перейти до вакансій →
          </Link>
        </div>
      ) : (
        <div className="result">Немає вакансій із зазначеною зарплатою за цим напрямком</div>
      )}
    </div>
  );
}
