import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbLd from "@/components/BreadcrumbLd";
import VacCard from "@/components/VacCard";
import { VACANCIES } from "@/lib/data";

export const metadata: Metadata = {
  title: "Старт кар'єри у Смілі — робота для студентів і без досвіду",
  description:
    "Перша робота у Смілі: вакансії без досвіду, для студентів та молоді. Поради, як почати кар'єру, скласти резюме та пройти співбесіду.",
  alternates: { canonical: "/start-kariery" },
};

export default function StartCareerPage() {
  const beginner = VACANCIES.filter((v) => !v.exp).slice(0, 6);

  return (
    <>
      <Header />
      <main>
      <BreadcrumbLd items={[{ name: "Головна", path: "/" },
          { name: "Старт кар'єри", path: "/start-kariery" }]} />
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
          <Link href="/robota-bez-dosvidu" className="service">
            <div className="s-ico">🌱</div>
            <h3>Робота без досвіду</h3>
            <p>Вакансії, де вас навчать з нуля прямо на робочому місці.</p>
          </Link>
          <Link href="/robota-dlya-studentiv" className="service">
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
            <Link href="/robota-bez-dosvidu" className="btn lg">
              Усі вакансії без досвіду →
            </Link>
          </p>
        </section>
        <section className="seo-text">
          <h2>Кому підходить старт кар’єри у Смілі</h2>
          <p>Почати кар’єру в місті реально навіть без досвіду та без диплома. Найбільше можливостей для новачків — у торгівлі, сфері обслуговування, на виробництві та у доставці. Роботодавці тут звикли навчати нових працівників прямо на робочому місці.</p>
          <p>Це також гарний варіант для студентів і тих, хто повертається на ринок праці після перерви: графіки часто гнучкі, а вимоги — прості.</p>
          <h2>Типові помилки на старті</h2>
          <ul><li>шукати одразу «ідеальну» роботу замість першого корисного досвіду;</li><li>не складати резюме взагалі або надсилати однакове на всі вакансії;</li><li>відгукуватися лише на одну пропозицію й чекати відповіді тижнями;</li><li>соромитися ставити запитання про графік, оформлення та виплати.</li></ul>
          <h2>Що робити в перші тижні</h2>
          <p>Покажіть себе відповідальним працівником: не запізнюйтесь, виконуйте домовленості, ставте запитання, якщо щось незрозуміло. Перший місяць — це фактично випробування, після якого керівник вирішує, чи варто підвищувати ставку або довіряти складніші задачі.</p>
          <p>Ведіть короткий перелік того, чого навчилися, і результатів, яких досягли. Ці факти знадобляться для резюме, коли захочете перейти на кращу позицію.</p>
        </section>

        <section className="faq-block">
          <h2 className="title" style={{ fontSize: 24 }}>Часті запитання</h2>
          <details className="faq-item"><summary>Чи можна почати кар’єру без досвіду у Смілі?</summary><p>Так. У місті чимало вакансій, де досвід не обов’язковий і роботодавець готовий навчати з нуля. Дивіться сторінку «Робота без досвіду».</p></details>
          <details className="faq-item"><summary>Що робити, якщо не знаю, ким хочу працювати?</summary><p>Почніть із роботи, яка розвиває універсальні навички — спілкування з людьми, відповідальність, роботу в команді. Далі буде легше визначитися з напрямком.</p></details>
          <details className="faq-item"><summary>Чи потрібен досвід для стажування?</summary><p>Зазвичай ні. Стажування та робота на стартових позиціях якраз і потрібні, щоб отримати перший досвід.</p></details>
        </section>
      </div>
            </main>
<Footer />
    </>
  );
}
