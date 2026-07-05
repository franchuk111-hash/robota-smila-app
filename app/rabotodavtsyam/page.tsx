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

      <Footer />
    </>
  );
}
