import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbLd from "@/components/BreadcrumbLd";
import { COMPANIES, VACANCIES } from "@/lib/data";

export const metadata: Metadata = {
  title: "Компанії Сміли — роботодавці та їхні вакансії",
  description:
    "Каталог роботодавців Сміли: магазини, виробництва, транспортні та будівельні компанії. Дізнайтесь про компанію та переглядайте її актуальні вакансії.",
  alternates: { canonical: "/kompanii" },
};

export default function KompaniiPage() {
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
        <h1 className="page-h1">Компанії Сміли</h1>
        <p className="sub">Роботодавці міста та їхні актуальні вакансії</p>
        <div className="grid3">
          {COMPANIES.map((c) => {
            const n = VACANCIES.filter((v) => v.company === c.name).length;
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
                  <span className="dot">·</span>Сміла, {c.district}
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
          <h2>Роботодавці Сміли: як ми збираємо каталог</h2>
          <p>У каталозі зібрані компанії, які реально працюють у Смілі та районі й розміщують вакансії на нашому сайті: продуктові магазини, транспортні та будівельні підприємства, харчове виробництво, охоронні фірми, заклади харчування й аграрні компанії.</p>
          <p>Кожна картка містить короткий опис діяльності, галузь і район міста. Це допомагає зрозуміти, чим займається роботодавець, ще до відгуку на вакансію.</p>
          <h2>У яких сферах працюють компанії міста</h2>
          <ul><li>роздрібна торгівля — мережі продуктових магазинів;</li><li>логістика та перевезення — вантажні компанії Черкаської області;</li><li>харчове виробництво — кондитерське та інше виробництво;</li><li>будівництво — компанії повного циклу з об’єктами у місті та районі;</li><li>безпека й охорона, ресторанний бізнес, сільське господарство.</li></ul>
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
