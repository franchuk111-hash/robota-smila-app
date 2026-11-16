import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbLd from "@/components/BreadcrumbLd";
import PayrollCalculator from "@/components/PayrollCalculator";
import Zarplatomir from "@/components/Zarplatomir";
import { getActiveVacancies } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Зарплатомір Сміли — зарплати та калькулятор на руки",
  description:
    "Перегляньте суми оплати в актуальних вакансіях Сміли за напрямками роботи. Відкрийте оголошення, щоб уточнити умови, або розрахуйте зарплату на руки.",
  alternates: { canonical: "/zarplatomir" },
};

export default function ZarplatomirPage() {
  const paidVacancies = getActiveVacancies()
    .filter(({ salary: [min, max] }) =>
      Number.isFinite(min) && Number.isFinite(max) && min >= 0 && max >= min && max > 0
    )
    .map(({ id, title, company, cat, salary }) => ({ id, title, company, cat, salary }));

  return (
    <>
      <Header />
      <main>
      <BreadcrumbLd items={[{ name: "Головна", path: "/" },
          { name: "Зарплатомір", path: "/zarplatomir" }]} />
      <div className="container">
        <nav className="crumbs">
          <Link href="/">Головна</Link> › Зарплатомір
        </nav>
        <h1 className="page-h1">Зарплатомір Сміли</h1>
        <p className="sub">
          Суми з актуальних оголошень про роботу у Смілі
        </p>
        <Zarplatomir vacancies={paidVacancies} />
        <PayrollCalculator />

        <section className="seo-text">
          <h2>Звідки беруться суми оплати</h2>
          <p>Для кожного напрямку показуємо до п’яти актуальних вакансій, у яких вказано суму або діапазон оплати. Усі пропозиції, зокрема оголошення без конкретної суми, є в каталозі вакансій.</p>
          <p>Ця добірка не представляє весь ринок праці Сміли. Суми наведено окремо для кожної вакансії, бо оголошення можуть описувати різні періоди оплати, ставки та премії.</p>
          <h2>Що впливає на рівень оплати</h2>
          <p>Для конкретної пропозиції уточніть кваліфікаційні вимоги, графік та склад оплати. Сума за годину, зміну, місяць або обсяг роботи не є безпосередньо порівнянною: перевіряйте одиницю розрахунку в першоджерелі.</p>
          <ul><li>необхідні навички та обсяг обов’язків;</li><li>тривалість зміни, тижневе навантаження й умови доплат;</li><li>офіційне оформлення, премії, харчування, розвозка до місця роботи;</li><li>розташування об’єкта та витрати на дорогу.</li></ul>
          <h2>Як користуватися Зарплатоміром</h2>
          <p>Оберіть напрямок і відкрийте потрібну вакансію. У картці знайдете деталі роботи та посилання на джерело, якщо воно доступне. Якщо знаєте нараховану суму, скористайтеся калькулятором зарплати на руки нижче списку.</p>
        </section>

        <section className="faq-block">
          <h2 className="title" style={{ fontSize: 24 }}>Часті запитання</h2>
          <details className="faq-item"><summary>Чому вакансії немає в добірці?</summary><p>Тут показано до п’яти актуальних вакансій із зазначеною сумою оплати за напрямком. Решта пропозицій, зокрема вакансії без конкретної суми, є в каталозі.</p></details>
          <details className="faq-item"><summary>Чи можна зіставляти ці суми між собою?</summary><p>Спочатку звірте період оплати, тривалість зміни та умови премій. Якщо сума включає доплати або вказана за інший період, пряме порівняння буде неточним.</p></details>
          <details className="faq-item"><summary>Сума в оголошенні вказана до чи після відрахувань?</summary><p>Це залежить від оголошення. Перед відгуком уточніть у роботодавця, яку суму нарахують і скільки ви отримаєте на руки.</p></details>
        </section>
      </div>
            </main>
<Footer />
    </>
  );
}
