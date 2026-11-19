import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbLd from "@/components/BreadcrumbLd";
import { commonWorkplace } from "@/lib/company-workplace";
import { getActiveCompanies, getActiveVacancies } from "@/lib/data";

export const metadata: Metadata = {
  title: "Каталог роботодавців та їхніх вакансій — Робота Сміла",
  description:
    "Роботодавці в каталозі «Робота Сміла»: магазини, виробництва, транспортні та будівельні компанії. Дізнайтесь про компанію та переглядайте її актуальні вакансії.",
  alternates: { canonical: "/kompanii" },
};

export default function KompaniiPage() {
  const VACANCIES = getActiveVacancies();
  return (
    <>
      <Header />
      <main>
      <BreadcrumbLd items={[{ name: "Головна", path: "/" },
          { name: "Компанії", path: "/kompanii" }]} />
      <div className="container">
        <nav className="crumbs">
          <Link href="/">Головна</Link> › Компанії
        </nav>
        <h1 className="page-h1">Каталог роботодавців</h1>
        <p className="sub">Роботодавці з поточної добірки оголошень</p>
        <div className="grid3">
          {getActiveCompanies().map((c) => {
            const list = VACANCIES.filter((v) => v.company === c.name);
            const n = list.length;
            const location = commonWorkplace(list);
            return (
              <article className="vac" key={c.slug}>
                <div className="company" style={{ fontSize: 19, marginBottom: 10 }}>
                  <span
                    className="co-ico"
                    style={{
                      width: 40,
                      height: 40,
                      fontSize: 22,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--soft)",
                    }}
                  >
                    {c.ico}
                  </span>
                  <Link href={`/kompaniya/${c.slug}`} style={{ color: "var(--ink2)" }}>
                    {c.name}
                  </Link>
                </div>
                <div className="locs">
                  {c.industry}
                  {location && <><span className="dot">·</span>Місце роботи: {location}</>}
                </div>
                <p style={{ color: "var(--muted)", margin: "12px 0 16px" }}>{c.about}</p>
                <Link href={`/kompaniya/${c.slug}`} className="btn ghost">
                  {n} {n === 1 ? "вакансія" : "вакансій"} →
                </Link>
              </article>
            );
          })}
        </div>
        <section className="seo-text">
          <h2>Як ми збираємо каталог роботодавців</h2>
          <p>До каталогу потрапляють компанії з відкритими вакансіями у добірці «Робота Сміла». Компанія може шукати працівників у кількох містах. Перевіряйте місце роботи в конкретному оголошенні.</p>
          <h2>Як знайти роботу через каталог</h2>
          <p>Оберіть компанію, яка вас цікавить, відкрийте її сторінку та перегляньте актуальні вакансії. Якщо потрібної позиції немає, загляньте в каталог вакансій за категоріями або підпишіться на наш Telegram-канал, щоб не пропустити нові пропозиції.</p>
        </section>

        <section className="faq-block">
          <h2 className="title" style={{ fontSize: 24 }}>Часті запитання</h2>
          <details className="faq-item"><summary>Чи всі роботодавці Сміли є в каталозі?</summary><p>Каталог постійно поповнюється. Ми додаємо компанії, які розміщують вакансії на сайті. Якщо вашої компанії ще немає — напишіть нам через сторінку «Роботодавцям».</p></details>
          <details className="faq-item"><summary>Як дізнатися, чи є у компанії відкриті вакансії?</summary><p>На картці кожної компанії вказано кількість актуальних вакансій. Натисніть на неї, щоб переглянути всі пропозиції цього роботодавця.</p></details>
          <details className="faq-item"><summary>Чи можна довіряти компаніям із каталогу?</summary><p>Ми публікуємо лише тих роботодавців, які розміщують реальні вакансії. Водночас радимо самостійно перевіряти умови праці та ніколи не надсилати передоплату.</p></details>
        </section>
      </div>
            </main>
<Footer />
    </>
  );
}

export const dynamic = "force-dynamic";
