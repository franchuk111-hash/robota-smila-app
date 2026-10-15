import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbLd from "@/components/BreadcrumbLd";
import { ARTICLES } from "@/lib/data";

export const metadata: Metadata = {
  title: "Блог про роботу у Смілі — поради та зарплати",
  description:
    "Корисні статті про пошук роботи у Смілі: середні зарплати, як скласти резюме, робота без досвіду та поради для шукачів роботи Черкаської області.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <>
      <Header />
      <main>
      <BreadcrumbLd items={[{ name: "Головна", path: "/" },
          { name: "Блог", path: "/blog" }]} />
      <div className="container">
        <nav className="crumbs">
          <Link href="/">Головна</Link> › Блог
        </nav>
        <h1 className="page-h1">Блог про роботу у Смілі</h1>
        <p className="sub">Поради для шукачів роботи, огляди зарплат та корисні матеріали</p>
        <div className="grid3">
          {ARTICLES.map((a) => (
            <article className="vac" key={a.slug}>
              <h3>
                <Link href={`/blog/${a.slug}`}>{a.title}</Link>
              </h3>
              <div className="locs dim" style={{ marginBottom: 12 }}>
                {new Date(a.date).toLocaleDateString("uk-UA", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <p style={{ color: "var(--muted)", margin: "0 0 16px" }}>{a.excerpt}</p>
              <Link href={`/blog/${a.slug}`} className="btn ghost">
                Читати статтю
              </Link>
            </article>
          ))}
        </div>
        <section className="seo-text">
          <h2>Про що ми пишемо</h2>
          <p>Блог «Робота Сміла» — це практичні матеріали для тих, хто шукає роботу в місті та Черкаській області. Ми розбираємо реальні теми: скільки платять за різними професіями, як скласти резюме без досвіду, як поводитися на співбесіді та де шукати роботу зі швидкою оплатою.</p>
          <p>Усі статті базуються на даних нашого сайту та загальновідомих практиках пошуку роботи. Ми не вигадуємо цифри: якщо наводимо діапазони зарплат, то спираємося на актуальні вакансії, розміщені роботодавцями Сміли.</p>
          <h2>Кому будуть корисні ці матеріали</h2>
          <ul><li>тим, хто шукає першу роботу й не має досвіду;</li><li>студентам, які поєднують навчання з підробітком;</li><li>досвідченим спеціалістам, які хочуть змінити сферу або роботодавця;</li><li>усім, хто хоче орієнтуватися в зарплатах і умовах праці міста.</li></ul>
          <h2>Як користуватися блогом</h2>
          <p>Відкрийте потрібну статтю, а в кінці кожної сторінки є перехід до актуальних вакансій Сміли. Якщо ви готуєтеся до співбесіди — почніть із матеріалу про резюме та порад для співбесіди, а якщо шукаєте орієнтир по грошах — із огляду зарплат.</p>
        </section>

        <section className="faq-block">
          <h2 className="title" style={{ fontSize: 24 }}>Часті запитання</h2>
          <details className="faq-item"><summary>Як часто з’являються нові статті?</summary><p>Ми публікуємо матеріали регулярно, у міру появи нових даних про ринок праці Сміли. Стежити за оновленнями зручно через наш Telegram-канал.</p></details>
          <details className="faq-item"><summary>Чи можна використовувати ці поради для інших міст?</summary><p>Базові принципи пошуку роботи універсальні, проте конкретні цифри та вакансії стосуються саме Сміли й Черкаської області.</p></details>
          <details className="faq-item"><summary>Де знайти самі вакансії, а не статті?</summary><p>Перейдіть у розділ «Вакансії» — там зібрані актуальні пропозиції роботодавців міста з фільтрами за категоріями та типом зайнятості.</p></details>
        </section>
      </div>
            </main>
<Footer />
    </>
  );
}
