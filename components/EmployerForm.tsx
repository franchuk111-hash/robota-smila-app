"use client";
import { useState } from "react";

export default function EmployerForm() {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (done)
    return (
      <div style={{ color: "var(--green)", fontWeight: 700, fontSize: 18 }}>
        ✓ Дякуємо! Вакансію надіслано на модерацію. Ми опублікуємо її протягом дня.
      </div>
    );

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErr("");
        const f = e.currentTarget;
        const g = (n: string) =>
          (f.elements.namedItem(n) as HTMLInputElement | HTMLTextAreaElement)?.value || "";
        const data = {
          kind: "employer",
          vacancy: g("vacancy"),
          company: g("company"),
          name: g("company"),
          phone: g("phone"),
          message: `Зарплата: ${g("salary")}. ${g("descr")}`,
        };
        try {
          const res = await fetch("/api/apply", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          const json = await res.json();
          if (json.ok) setDone(true);
          else setErr(json.error || "Помилка. Спробуйте ще раз.");
        } catch {
          setErr("Помилка мережі. Спробуйте ще раз.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="field">
        <label>Назва вакансії *</label>
        <input name="vacancy" required placeholder="Напр. Продавець-касир" />
      </div>
      <div className="field">
        <label>Назва компанії *</label>
        <input name="company" required placeholder="ТОВ / ФОП / магазин" />
      </div>
      <div className="field">
        <label>Зарплата, грн</label>
        <input name="salary" placeholder="напр. 16000 – 20000" />
      </div>
      <div className="field">
        <label>Опис вакансії *</label>
        <textarea name="descr" rows={5} required placeholder="Обов'язки, вимоги, умови" />
      </div>
      <div className="field">
        <label>Контактний телефон *</label>
        <input name="phone" required type="tel" placeholder="+380..." />
      </div>
      {err && <p style={{ color: "#e11d48", fontSize: 14, margin: "0 0 10px" }}>{err}</p>}
      <button className="btn green" type="submit" style={{ width: "100%" }} disabled={busy}>
        {busy ? "Надсилаємо…" : "Надіслати на модерацію"}
      </button>
    </form>
  );
}
