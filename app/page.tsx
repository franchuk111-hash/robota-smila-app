import Link from "next/link";
import type { Metadata } from "next";
import { SITE_NAME, HOME_TITLE, HOME_DESCRIPTION } from "@/lib/site-metadata";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbLd from "@/components/BreadcrumbLd";
import VacCard from "@/components/VacCard";
import Hero from "@/components/Hero";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import { getActiveVacancies, CATEGORIES, dateFmt } from "@/lib/data";
import { organizationLd, homepageFaq, itemListLd, faqLd } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    siteName: SITE_NAME,
    url: "https://robota-smila.com.ua/",
    locale: "uk_UA",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Робота Сміла — вакансії міста" }],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: ["/og.png"],
  },
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://robota-smila.com.ua/#website",
  name: SITE_NAME,
  alternateName: ["Robota Smila", "robota-smila.com.ua"],
  publisher: { "@id": "https://robota-smila.com.ua/#organization" },
  url: "https://robota-smila.com.ua/",
  inLanguage: "uk-UA",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://robota-smila.com.ua/vakansii?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function Home() {
  const VACANCIES = getActiveVacancies();
  const latest = [...VACANCIES]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 6);
  const faqs = homepageFaq(VACANCIES);

  return (
    <>
      <JsonLd data={websiteLd} />
      <JsonLd data={organizationLd} />
      <JsonLd data={itemListLd(latest)} />
      <JsonLd data={faqLd(faqs)} />
      <Header />
      <main>
      <BreadcrumbLd items={[{ name: "Головна", path: "/" }]} />
      <Hero vacancyCount={VACANCIES.length} companyCount={new Set(VACANCIES.map((v) => v.company)).size} />

      <section className="block">
        <div className="container">
          <Reveal>
            <h2 className="title center">Нові вакансії у Смілі</h2>
            <p className="sub center">
              {latest.length ? `Найновіше оголошення: ${dateFmt(latest[0].date)}.` : "Наразі свіжих оголошень немає."} Перегляньте деталі на сайті або відкрийте пост у Telegram.
            </p>
          </Reveal>
          <div className="grid3" data-nosnippet>
            {latest.map((v) => <VacCard key={v.id} v={v} />)}
          </div>
          <p style={{ textAlign: "center", marginTop: 36 }}>
            <Link href="/vakansii" className="btn lg">
              Усі вакансії
            </Link>
          </p>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <Reveal>
            <h2 className="title center">Вакансії за категоріями</h2>
            <p className="sub center">
              Оберіть напрямок і подивіться актуальні пропозиції у Смілі
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="cats">
              {CATEGORIES.map((c) => {
                const n = VACANCIES.filter((v) => v.cat === c.slug).length;
                return (
                  <Link key={c.slug} className="cat" href={`/vakansii/${c.slug}`}>
                    <span className="ico">{c.ico}</span>
                    <span>
                      <span className="n">{c.name}</span>
                      <br />
                      <span className="c">{n} вакансій</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal>
            <h2 className="title center">Корисні сервіси</h2>
            <p className="sub center">Інструменти, що допоможуть швидше знайти роботу</p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="services">
              <Link href="/zarplatomir" className="service">
                <div className="s-ico">💰</div>
                <h3>Зарплатомір</h3>
                <p>Дізнайтесь середню зарплату у Смілі за вашою професією.</p>
              </Link>
              <Link href="/kalendar" className="service">
                <div className="s-ico">📅</div>
                <h3>Виробничий календар</h3>
                <p>Робочі, вихідні та святкові дні 2026 для розрахунку відпусток.</p>
              </Link>
              <Link href="/start-kariery" className="service">
                <div className="s-ico">🚀</div>
                <h3>Старт кар&apos;єри</h3>
                <p>Перша робота, стажування та вакансії для студентів і без досвіду.</p>
              </Link>
              <Link href="/rezume" className="service">
                <div className="s-ico">📄</div>
                <h3>Приклад резюме</h3>
                <p>Готовий зразок резюме з поясненнями, лайфхаки та фішки.</p>
              </Link>
              <Link href="/blog" className="service">
                <div className="s-ico">💡</div>
                <h3>Поради для роботи</h3>
                <p>Статті про пошук роботи, зарплати та кар&apos;єру у Смілі.</p>
              </Link>
              <Link href="/kompanii" className="service">
                <div className="s-ico">🏢</div>
                <h3>Каталог компаній</h3>
                <p>Роботодавці Сміли та їхні актуальні вакансії в одному місці.</p>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal>
            <div className="seo-text">
              <h2>Пошук роботи у Смілі, Черкаська область</h2>
              <p>
                <b>robota-smila.com.ua</b> — локальний сайт вакансій для міста
                Сміла. Тут зібрані пропозиції роботи з відкритих джерел від
                роботодавців Черкаської області: від продавців і водіїв до
                операторів виробництва, бухгалтерів та охоронців.
              </p>
              <p>
                Шукаєте <b>роботу без досвіду</b> або <b>підробіток у Смілі</b>?
                Використовуйте зручні фільтри за типом зайнятості, графіком і
                зарплатою. Зберігайте вакансії та відкривайте оголошення в
                Telegram, щоб уточнити актуальність і спосіб зв’язку з роботодавцем.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="block soft">
        <div className="container">
          <Reveal>
            <h2 className="title center">Часті запитання</h2>
          </Reveal>
          <section className="faq-block">
            {faqs.map((f) => (
              <details key={f.q} className="faq-item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </section>
        </div>
      </section>

            </main>
<Footer />
    </>
  );
}

export const dynamic = "force-dynamic";
