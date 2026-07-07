import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubscribeCTA from "@/components/SubscribeCTA";
import SubscriberCount from "@/components/SubscriberCount";

export const metadata: Metadata = {
  title: "Розіграш для підписників — Робота Сміла в Telegram",
  description:
    "Підпишись на Telegram-канал «Робота Сміла» та візьми участь у розіграші. Свіжі вакансії міста щодня + шанс виграти приз.",
  alternates: { canonical: "/aktsiya" },
};

const STEPS = [
  { n: 1, t: "Підпишись на канал", d: "Тисни кнопку й приєднуйся до Telegram-каналу «Робота Сміла»." },
  { n: 2, t: "Будь активним", d: "Читай вакансії, обирай найкращі, діли з друзями з міста." },
  { n: 3, t: "Чекай на розіграш", d: "Переможця оголосимо серед підписників прямо в каналі." },
];

export default function AktsiyaPage() {
  return (
    <>
      <Header />
      <div className="container">
        <section className="promo">
          <div className="promo-badge">🎁 Акція для підписників</div>
          <h1 className="promo-h1">
            Підпишись на «Робота Сміла» — <span>візьми участь у розіграші</span>
          </h1>
          <p className="promo-sub">
            Щодня публікуємо свіжі вакансії Сміли в Telegram. Приєднуйся до спільноти
            містян, які знаходять роботу першими — і отримай шанс виграти приз.
          </p>
          <div className="promo-count">
            <SubscriberCount />
          </div>
          <div className="promo-cta">
            <SubscribeCTA source="aktsiya_hero" label="Підписатись і брати участь" large />
          </div>
        </section>

        <section className="promo-steps">
          <h2 className="title">Як взяти участь</h2>
          <div className="grid3">
            {STEPS.map((s) => (
              <div className="promo-step" key={s.n}>
                <div className="promo-step-n">{s.n}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="promo-final">
          <h2>Готовий? Приєднуйся за секунду</h2>
          <p>Умови розіграшу та дату оголошення переможця дивись у закріпленому пості каналу.</p>
          <SubscribeCTA source="aktsiya_footer" label="Підписатись на Telegram" large />
        </section>
      </div>
      <Footer />
    </>
  );
}
