import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VacCard from "@/components/VacCard";
import Hero from "@/components/Hero";
import Reveal from "@/components/Reveal";
import { VACANCIES, CATEGORIES } from "@/lib/data";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Робота Сміла",
  alternateName: "robota-smila.com.ua",
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
  const latest = [...VACANCIES]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 6);
  // Пріоритет у «Гарячих»: спершу вакансії VGB, далі решта гарячих за свіжістю
  const PRIORITY_COMPANY = "V.G.BuildingTeam";
  const hot = VACANCIES.filter((v) => v.hot).sort((a, b) => {
    const pa = a.company === PRIORITY_COMPANY ? 0 : 1;
    const pb = b.company === PRIORITY_COMPANY ? 0 : 1;
    if (pa !== pb) return pa - pb;
    return +new Date(b.date) - +new Date(a.date);
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />
      <Header />
      <Hero />

      {hot.length > 0 && (
        <section className="block" style={{ paddingBottom: 0 }}>
          <div className="container">
            <Reveal>
              <h2 className="title center">🔥 Гарячі вакансії</h2>
              <p className="sub center">
                Найактуальніші пропозиції — роботодавці шукають прямо зараз
              </p>
            </Reveal>
            <div className="grid3">
              {hot.map((v) => (
                <VacCard key={v.id} v={v} />
              ))}
            </div>
          </div>
        </section>
      )}

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
            <h2 className="title center">420 актуальних вакансій у Смілі</h2>
          </Reveal>
          <div className="grid3">
            {latest.map((v) => (
              <VacCard key={v.id} v={v} />
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: 36 }}>
            <Link href="/vakansii" className="btn lg">
              Ще вакансії
            </Link>
          </p>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal>
            <div className="seo-text">
              <h2>Пошук роботи у Смілі, Черкаська область</h2>
              <p>
                <b>robota-smila.com.ua</b> — локальний сайт вакансій для міста
                Сміла. Тут зібрані актуальні пропозиції роботи від перевірених
                роботодавців Черкаської області: від продавців і водіїв до
                операторів виробництва, бухгалтерів та охоронців.
              </p>
              <p>
                Шукаєте <b>роботу без досвіду</b> або <b>підробіток у Смілі</b>?
                Використовуйте зручні фільтри за типом зайнятості, графіком і
                зарплатою. Реєструйтесь через Google або Telegram, зберігайте
                вакансії та відгукуйтесь онлайн за кілька хвилин.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
