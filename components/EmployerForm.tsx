"use client";
import { usePathname } from "next/navigation";
import { getOutboundHref, OUTBOUND_REL } from "@/lib/outbound-links";
import { useRef, useState } from "react";
import { trackEvent } from "@/lib/ga4";

export default function EmployerForm() {
  const pathname = usePathname();
  const submitting = useRef(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (done)
    return (
      <div style={{ color: "var(--green)", fontWeight: 700, fontSize: 18 }}>
        ✓ Заявку доставлено адміністратору. Умови, вартість і час розміщення узгоджуємо до публікації.
      </div>
    );

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (submitting.current) return;
        submitting.current = true;
        trackEvent("employer_lead_attempt");
        setBusy(true);
        setErr("");
        const f = e.currentTarget;
        const g = (n: string) =>
          (f.elements.namedItem(n) as HTMLInputElement | HTMLTextAreaElement)?.value || "";
        const data = {
          kind: "employer",
          placement: g("placement"),
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
            signal: AbortSignal.timeout(15000),
          });
          const json = await res.json();
          if (res.ok && json.ok) { setDone(true); trackEvent("employer_lead_delivered"); }
          else { setErr(json.error || "Помилка. Спробуйте ще раз."); trackEvent("employer_lead_error"); }
        } catch {
          setErr("Статус доставки невідомий: заявка могла надійти. Уточніть у @Smila_admin перед повтором, щоб уникнути дубля.");
          trackEvent("employer_lead_error");
        } finally {
          submitting.current = false;
          setBusy(false);
        }
      }}
    >
      <div className="field">
        <label htmlFor="vacancy">Назва вакансії *</label>
        <input maxLength={160} id="vacancy" name="vacancy" required placeholder="Напр. Продавець-касир" />
      </div>
      <div className="field">
        <label htmlFor="company">Назва компанії *</label>
        <input maxLength={160} id="company" name="company" required placeholder="ТОВ / ФОП / магазин" />
      </div>
      <div className="field">
        <label htmlFor="salary">Зарплата, грн</label>
        <input maxLength={100} id="salary" name="salary" placeholder="напр. 16000 – 20000" />
      </div>
      <div className="field">
        <label htmlFor="descr">Опис вакансії *</label>
        <textarea maxLength={2200} id="descr" name="descr" rows={5} required placeholder="Обов'язки, вимоги, умови" />
      </div>
      <div className="field">
        <label htmlFor="phone">Контактний телефон *</label>
        <input maxLength={25} id="phone" name="phone" required type="tel" placeholder="+380..." />
      </div>
      <div className="field">
        <label htmlFor="placement">Цікавить розміщення</label>
        <select id="placement" name="placement" defaultValue="Сайт + Telegram">
          <option>Сайт + Telegram</option><option>Потрібна консультація</option>
        </select>
      </div>
      <p>Надсилаючи заявку, ви погоджуєтеся на обробку контактів для узгодження розміщення відповідно до <a href="/polityka-konfidentsiynosti">політики конфіденційності</a>. Заявка не є оплатою чи підтвердженням публікації.</p>
      <p><a href={getOutboundHref("https://t.me/Smila_admin", pathname)} target="_blank" rel={OUTBOUND_REL} onClick={() => trackEvent("employer_contact_telegram")}>Обговорити розміщення з @Smila_admin у Telegram</a></p>
      {err && <p role="alert" style={{ color: "#e11d48", fontSize: 14, margin: "0 0 10px" }}>{err}</p>}
      <button className="btn green" type="submit" style={{ width: "100%" }} disabled={busy}>
        {busy ? "Надсилаємо…" : "Надіслати на модерацію"}
      </button>
    </form>
  );
}
