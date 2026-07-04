import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VacCard from "@/components/VacCard";
import Parallax from "@/components/Parallax";
import { VACANCIES, CATEGORIES } from "@/lib/data";

export default function Home() {
  const latest = [...VACANCIES]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 6);
  const hot = VACANCIES.filter((v) => v.hot);

  return (
    <>
      <Header />
      <Parallax />
      <section className="hero">
        <span className="illus i1" data-parallax="0.18" data-rot="-8">👩‍🍳</span>
        <span className="illus i2" data-parallax="-0.12" data-rot="7">🚚</span>
        <span className="illus i3" data-parallax="0.24" data-rot="-5">🧑‍💼</span>
        <div className="container">
          <h1>
            Знайдіть роботу
            <br />
            прямо зараз
          </h1>
          <p>
            Актуальні вакансії у Смілі та Черкаській області. Повна і часткова
            зайнятість, підробіток, робота без досвіду.
          </p>
          <form className="searchbar" action="/vakansii" method="get">
            <input
              type="text"
              name="q"
              placeholder="Посада, компанія або ключове слово"
            />
            <input
              type="text"
              value="Сміла"
              readOnly
              style={{ maxWidth: 200, flex: "0 0 200px" }}
            />
            <button className="btn" type="submit">
              Шукати
            </button>
          </form>
          <div className="stats">
            <div className="s">
              <b>420+</b>
              <span>активних вакансій</span>
            </div>
            <div className="s">
              <b>85</b>
              <span>компаній Сміли</span>
            </div>
            <div className="s">
              <b>17</b>
              <span>нових сьогодні</span>
            </div>
          </div>
        </div>
      </section>

      {hot.length > 0 && (
        <section className="block" style={{ paddingBottom: 0 }}>
          <div className="container">
            <h2 className="title center">🔥 Гарячі вакансії</h2>
            <p className="sub center">
              Найактуальніші пропозиції — роботодавці шукають прямо зараз
            </p>
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
          <h2 className="title center">Вакансії за категоріями</h2>
          <p className="sub center">
            Оберіть напрямок і подивіться актуальні пропозиції у Смілі
          </p>
          <div className="cats">
            {CATEGORIES.map((c) => {
              const n = VACANCIES.filter((v) => v.cat === c.slug).length;
              return (
                <Link key={c.slug} className="cat" href={`/vakansii?cat=${c.slug}`}>
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
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2 className="title center">Корисні сервіси</h2>
          <p className="sub center">Інструменти, що допоможуть швидше знайти роботу</p>
          <div className="services">
            <Link href="/zarplatomir" className="service">
              <div className="s-ico">💰</div>
              <h3>Зарплатомір</h3>
              <p>Дізнайтесь середню зарплату у Смілі за вашою професією.</p>
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
          </div>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="container">
          <h2 className="title center">420 актуальних вакансій у Смілі</h2>
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
        </div>
      </section>

      <Footer />
    </>
  );
}
