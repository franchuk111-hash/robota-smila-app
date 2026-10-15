import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmployerForm from "@/components/EmployerForm";

export const metadata: Metadata = {
  title: "Розмістити вакансію у Смілі — пошук працівників",
  description:
    "Розмістіть вакансію у Смілі та знайдіть співробітників швидко. Ваше оголошення побачать сотні місцевих шукачів роботи. Просте розміщення за 5 хвилин!",
  alternates: { canonical: "/rabotodavtsyam" },
};

export default function EmployerPage() {
  return (
    <>
      <Header employer />
      <main>
      <section className="hero">
        <div className="container">
          <h1>Знайдіть працівників у Смілі</h1>
          <p>
            Розмістіть вакансію на robota-smila.com.ua — і ваше оголошення побачать
            сотні місцевих шукачів роботи вже сьогодні.
          </p>
          <a href="#form" className="btn lg">
            ➕ Розмістити вакансію
          </a>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <h2 className="title center">Як це працює</h2>
          <p className="sub center">Три прості кроки до нового співробітника</p>
          <div className="steps">
            <div className="step">
              <div className="num">1</div>
              <h3>Опишіть вакансію</h3>
              <p style={{ color: "var(--muted)" }}>
                Заповніть коротку форму: посада, зарплата, вимоги та контакти.
              </p>
            </div>
            <div className="step">
              <div className="num">2</div>
              <h3>Ми публікуємо</h3>
              <p style={{ color: "var(--muted)" }}>
                Після модерації вакансія з&apos;являється у каталозі та в пошуку Google.
              </p>
            </div>
            <div className="step">
              <div className="num">3</div>
              <h3>Отримуйте відгуки</h3>
              <p style={{ color: "var(--muted)" }}>
                Кандидати відгукуються онлайн — ви отримуєте їхні контакти.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="block" id="form" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="detail" style={{ maxWidth: 640 }}>
            <h2 style={{ marginTop: 0 }}>Розмістити вакансію</h2>
            <EmployerForm />
          </div>
        </div>
      </section>

        <section className="seo-text">
          <h2>Чому варто розмістити вакансію у Смілі</h2>
          <p>Ваше оголошення побачать місцеві шукачі роботи, які шукають саме у Смілі та районі — без зайвих витрат на рекламу для людей з інших регіонів. Оголошення потрапляє в каталог, у пошук Google і в наш Telegram-канал.</p>
          <p>Ми орієнтуємося на локальний ринок праці, тому відгуки надходять швидше й частіше від кандидатів, які справді готові вийти на роботу в місті.</p>
          <h2>Як скласти оголошення, на яке відгукуються</h2>
          <ul><li>чітко вкажіть посаду, зарплату та графік — це перше, на що дивляться кандидати;</li><li>опишіть обов’язки простими словами, без канцеляризмів;</li><li>перелічіть реальні вимоги й окремо позначте, чи можна без досвіду;</li><li>додайте умови, які мотивують: премії, харчування, розвозку, оформлення.</li></ul>
          <h2>Що відбувається після публікації</h2>
          <p>Після модерації вакансія з’являється в каталозі сайту та в пошуковій видачі. Кандидати відгукуються онлайн, і заявка одразу надходить до вас у Telegram — залишається зв’язатися з людиною та запросити на співбесіду.</p>
        </section>

        <section className="faq-block">
          <h2 className="title" style={{ fontSize: 24 }}>Часті запитання</h2>
          <details className="faq-item"><summary>Скільки часу займає розміщення вакансії?</summary><p>Заповнення форми займає близько 5 хвилин. Після модерації вакансія з’являється в каталозі та в пошуку.</p></details>
          <details className="faq-item"><summary>Чи можна оновити або зняти оголошення?</summary><p>Так. Зв’яжіться з нами через Telegram, і ми оновимо текст або знімемо вакансію, якщо позицію вже закрито.</p></details>
          <details className="faq-item"><summary>Чи впливає розмір компанії на публікацію?</summary><p>Ні. Ми працюємо і з невеликими магазинами, і з підприємствами — головне, щоб вакансія була реальною та актуальною.</p></details>
        </section>
            </main>
<Footer />
    </>
  );
}
