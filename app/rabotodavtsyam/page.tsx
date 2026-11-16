import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EmployerForm from "@/components/EmployerForm";

export const metadata: Metadata = {
  title: "Розмістити вакансію у Смілі — пошук працівників",
  description:
    "Залиште заявку на розміщення вакансії у Смілі на сайті та в Telegram. Умови і вартість узгоджуються з адміністратором до публікації.",
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
            Залиште заявку на розміщення на сайті та в Telegram-каналі «Робота Сміла».
            Допомогу з текстом, вартість і строки узгодимо з вами до публікації.
          </p>
          <a href="#form" className="btn lg">
            ➕ Розмістити вакансію
          </a>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <h2 className="title center">Як це працює</h2>
          <p className="sub center">Від заявки до публікації</p>
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
              <h3>Узгоджуємо розміщення</h3>
              <p style={{ color: "var(--muted)" }}>
                Адміністратор перевіряє текст і погоджує з вами формат, вартість та час публікації.
              </p>
            </div>
            <div className="step">
              <div className="num">3</div>
              <h3>Публікуємо погоджений текст</h3>
              <p style={{ color: "var(--muted)" }}>
                Після погодження розміщуємо вакансію з вашими контактами. Кандидати звертаються за ними; кількість відгуків і найм не гарантуються.
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
          <p>«Робота Сміла» — місцевий каталог вакансій. У формі можна залишити заявку на розміщення на сайті й у Telegram або попросити консультацію щодо умов.</p>
          <h2>Як скласти оголошення, на яке відгукуються</h2>
          <ul><li>чітко вкажіть посаду, зарплату та графік — це перше, на що дивляться кандидати;</li><li>опишіть обов’язки простими словами, без канцеляризмів;</li><li>перелічіть реальні вимоги й окремо позначте, чи можна без досвіду;</li><li>додайте умови, які мотивують: премії, харчування, розвозку, оформлення.</li></ul>
          <h2>Що відбувається після публікації</h2>
          <p>Вкажіть у вакансії, як кандидатам з вами зв’язатися. Після публікації шукачі можуть звернутися за контактами, вказаними в оголошенні.</p>
        </section>

        <section className="faq-block">
          <h2 className="title" style={{ fontSize: 24 }}>Часті запитання</h2>
          <details className="faq-item"><summary>Скільки часу займає розміщення вакансії?</summary><p>Час публікації узгодите з адміністратором після перевірки тексту вакансії.</p></details>
          <details className="faq-item"><summary>Чи можна оновити або зняти оголошення?</summary><p>Так. Зв’яжіться з нами через Telegram, і ми оновимо текст або знімемо вакансію, якщо позицію вже закрито.</p></details>
          <details className="faq-item"><summary>Чи впливає розмір компанії на публікацію?</summary><p>Ні. Ми працюємо і з невеликими магазинами, і з підприємствами — головне, щоб вакансія була реальною та актуальною.</p></details>
        </section>
            </main>
<Footer />
    </>
  );
}
