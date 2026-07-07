"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { VACANCIES, CATEGORIES } from "@/lib/data";

export default function Zarplatomir() {
  const [cat, setCat] = useState(CATEGORIES[0].slug);

  const stat = useMemo(() => {
    const list = VACANCIES.filter((v) => v.cat === cat);
    if (!list.length) return null;
    // Для середньої рахуємо лише вакансії з вказаною зарплатою (не «Договірна»)
    const paid = list.filter((v) => !(v.salary[0] === 0 && v.salary[1] === 0));
    if (!paid.length) return { count: list.length, avgMin: 0, avgMax: 0, mid: 0 };
    const avgMin = Math.round(paid.reduce((s, v) => s + v.salary[0], 0) / paid.length);
    const avgMax = Math.round(paid.reduce((s, v) => s + v.salary[1], 0) / paid.length);
    const mid = Math.round((avgMin + avgMax) / 2);
    return { count: list.length, avgMin, avgMax, mid };
  }, [cat]);

  const f = (n: number) => n.toLocaleString("uk-UA");

  return (
    <div className="zp">
      <label style={{ fontWeight: 700, color: "var(--ink2)", display: "block", marginBottom: 8 }}>
        Оберіть напрямок роботи:
      </label>
      <select value={cat} onChange={(e) => setCat(e.target.value)}>
        {CATEGORIES.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.ico} {c.name}
          </option>
        ))}
      </select>

      {stat ? (
        <div className="result">
          <div className="lbl">Середня зарплата у Смілі</div>
          <div className="big">{f(stat.mid)} ₴</div>
          <div className="lbl" style={{ marginTop: 6 }}>
            діапазон {f(stat.avgMin)} – {f(stat.avgMax)} ₴ · за {stat.count} вакансіями
          </div>
          <Link
            href={`/vakansii/${cat}`}
            className="btn"
            style={{ marginTop: 18 }}
          >
            Перейти до вакансій →
          </Link>
        </div>
      ) : (
        <div className="result">Немає даних за цим напрямком</div>
      )}
    </div>
  );
}
