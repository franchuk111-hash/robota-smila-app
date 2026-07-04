"use client";
import { useState } from "react";

export default function ApplyForm({
  vacancy,
  company,
}: {
  vacancy: string;
  company: string;
}) {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  return (
    <aside className="aside-apply">
      <h3 style={{ marginTop: 0 }}>Відгукнутися</h3>
      {done ? (
        <div style={{ color: "var(--green)", fontWeight: 700 }}>
          ✓ Ваш відгук надіслано! Роботодавець зв&apos;яжеться з вами.
        </div>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setErr("");
            const f = e.currentTarget;
            const data = {
              kind: "apply",
              vacancy,
              company,
              name: (f.elements.namedItem("name") as HTMLInputElement).value,
              phone: (f.elements.namedItem("phone") as HTMLInputElement).value,
              message: (f.elements.namedItem("message") as HTMLTextAreaElement).value,
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
            <label>Ваше ім&apos;я</label>
            <input name="name" required placeholder="Ім'я" />
          </div>
          <div className="field">
            <label>Телефон</label>
            <input name="phone" required placeholder="+380..." type="tel" />
          </div>
          <div className="field">
            <label>Повідомлення (необов&apos;язково)</label>
            <textarea name="message" rows={3} placeholder="Кілька слів про себе" />
          </div>
          {err && (
            <p style={{ color: "#e11d48", fontSize: 14, margin: "0 0 10px" }}>{err}</p>
          )}
          <button className="btn green" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Надсилаємо…" : "Надіслати відгук"}
          </button>
          <p style={{ color: "var(--muted)", fontSize: 13, margin: "10px 0 0" }}>
            Натискаючи кнопку, ви погоджуєтесь на обробку даних.
          </p>
        </form>
      )}
    </aside>
  );
}
