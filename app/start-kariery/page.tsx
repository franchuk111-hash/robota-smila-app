import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VacCard from "@/components/VacCard";
import { VACANCIES } from "@/lib/data";

export const metadata: Metadata = {
  title: "Старт кар'єри у Смілі — робота для студентів і без досвіду",
  description:
    "Перша робота у Смілі: вакансії без досвіду, для студентів та молоді. Поради, як почати кар'єру, скласти резюме та пройти співбесіду.",
};

export default function StartCareerPage() {
  const beginner = VACANCIES.filter((v) => !v.exp).slice(0, 6);

  return (
    <>
      <Header />
      <div className="container">
        <nav className="crumbs">
          <Link href="/">Головна</Link> › Старт кар&apos;єри
        </nav>

        <div className="start-hero">
          <h1 className="page-h1">🚀 Старт кар&apos;єри у Смілі</h1>
          <p className="sub" style={{ marginBottom: 0 }}>
            Перша робота, стажування та вакансії без досвіду для студентів і молоді.
            Почніть кар&apos;єру у Смілі вже зараз.
          </p>
        </div>

        <div className="services">
          <Link href="/vakansii?exp=1" className="service">
            <div className="s-ico">🌱</div>
            <h3>Робота без досвіду</h3>
            <p>Вакансії, де вас навчать з нуля прямо на робочому місці.</p>
          </Link>
          <Link href="/vakansii?cat=horeca" className="service">
            <div className="s-ico">🎓</div>
            <h3>Для студентів</h3>
            <p>Часткова зайнятість і гнучкий графік — сумісно з навчанням.</p>
          </Link>
          <Link href="/rezume" className="service">
            <div className="s-ico">📄</div>
            <h3>Приклад резюме</h3>
            <p>Як скласти перше резюме без досвіду — зразок і лайфхаки.</p>
          </Link>
        </div>

        <section className="block" style={{ paddingBottom: 0 }}>
          <h2 className="title">Як почати кар&apos;єру: 4 кроки</h2>
          <div className="grid2" style={{ marginTop: 18 }}>
            <div className="callout">
              <b>1. Визначте напрямок.</b> Оберіть сферу, яка цікава: торгівля,
              виробництво, сервіс. Не бійтеся пробувати — перша робота рідко буде
              останньою.
            </div>
            <div className="callout tip">
              <b>2. Складіть резюме.</b> Навіть без досвіду. Зробіть акцент на
              особистих якостях, навчанні та бажанні працювати.{" "}
              <Link href="/rezume">Дивитись приклад →</Link>
            </div>
            <div className="callout">
              <b>3. Відгукніться на кілька вакансій.</b> Не зупиняйтесь на одній —
              більше відгуків, більше шансів на запрошення.
            </div>
            <div className="callout warn">
              <b>4. Підготуйтесь до співбесіди.</b> Дізнайтесь про компанію,
              продумайте відповіді та приходьте вчасно. Впевненість — половина
              успіху.
            </div>
          </div>
        </section>

        <section className="block">
          <h2 className="title">Вакансії для початківців у Смілі</h2>
          <div className="grid3" style={{ marginTop: 18 }}>
            {beginner.map((v) => (
              <VacCard key={v.id} v={v} />
            ))}
          </div>
          <p style={{ textAlign: "center", marginTop: 30 }}>
            <Link href="/vakansii?exp=1" className="btn lg">
              Усі вакансії без досвіду →
            </Link>
          </p>
        </section>
      </div>
      <Footer />
    </>
  );
}
