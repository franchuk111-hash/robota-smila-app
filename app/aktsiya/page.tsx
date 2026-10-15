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
      <main>
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
        <section className="seo-text">
          <h2>Що дає підписка на канал «Робота Сміла»</h2>
          <p>У Telegram-каналі ми публікуємо свіжі вакансії Сміли та Черкаської області. Підписники дізнаються про нові пропозиції одними з перших — ще до того, як роботодавець закриє позицію.</p>
          <p>Це зручно: не потрібно щодня перевіряти сайт, усі нові оголошення приходять прямо в месенджер. Окремі пости присвячені вакансіям без досвіду, підробітку та роботі зі щоденною оплатою.</p>
          <h2>Як проходить розіграш</h2>
          <p>Окрім корисних вакансій, серед активних підписників ми періодично проводимо розіграші призів. Щоб узяти участь, достатньо підписатися на канал і бути активним — читати вакансії та ділитися ними з друзями з міста.</p>
          <p>Дату оголошення переможця та умови конкретного розіграшу завжди публікуємо в закріпленому пості каналу. Переможця обираємо серед підписників випадковим чином — це чесний і прозорий механізм.</p>
          <h2>Правила чесної участі</h2>
          <ul><li>підписка на канал має бути активною на момент розіграшу;</li><li>один акаунт — одна участь;</li><li>переможець має вийти на зв’язок протягом зазначеного в пості часу;</li><li>деталі кожного розіграшу публікуємо окремо в каналі.</li></ul>
        </section>

        <section className="faq-block">
          <h2 className="title" style={{ fontSize: 24 }}>Часті запитання</h2>
          <details className="faq-item"><summary>Чи обов’язково бути підписником для участі?</summary><p>Так, розіграші проводимо серед підписників каналу «Робота Сміла» — це основна умова участі.</p></details>
          <details className="faq-item"><summary>Чи потрібно щось платити за участь?</summary><p>Ні. Участь у розіграші безкоштовна. Якщо хтось просить гроші нібито від нашого імені — це шахрайство, повідомте нам.</p></details>
          <details className="faq-item"><summary>Як дізнатися про переможця?</summary><p>Результати публікуємо в тому ж Telegram-каналі. Стежте за закріпленим постом, щоб не пропустити оголошення.</p></details>
        </section>
      </div>
            </main>
<Footer />
    </>
  );
}
