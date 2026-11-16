import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbLd from "@/components/BreadcrumbLd";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import { getOutboundHref, OUTBOUND_DESTINATIONS, OUTBOUND_REL } from "@/lib/outbound-links";

const path = "/pro-proiekt";
const title = "Про проєкт «Робота Сміла»";
const description =
  "Звідки «Робота Сміла» бере оголошення, як перевірити умови вакансії та куди повідомити про помилку.";
const site = "https://robota-smila.com.ua";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: path },
};

const aboutPageLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "@id": site + path + "#webpage",
  url: site + path,
  name: title,
  description,
  inLanguage: "uk-UA",
  about: { "@id": site + "/#organization" },
  isPartOf: { "@id": site + "/#website" },
};

export default function AboutProjectPage() {
  return (
    <>
      <Header />
      <main>
        <JsonLd data={aboutPageLd} />
        <BreadcrumbLd items={[{ name: "Головна", path: "/" }, { name: "Про проєкт", path }]} />
        <div className="container">
          <nav className="crumbs" aria-label="Ви тут">
            <Link href="/">Головна</Link> › <span aria-current="page">Про проєкт</span>
          </nav>
          <article className="legal">
            <h1 className="page-h1">{title}</h1>
            <p>
              «Робота Сміла» — сайт оголошень про роботу у Смілі та Черкаській області.
              У <Link href="/vakansii">каталозі вакансій</Link> можна шукати за професією та
              фільтрувати пропозиції за категорією й типом зайнятості. Сайт допомагає знайти
              оголошення, а рішення про найм ухвалює роботодавець.
            </p>

            <h2>Звідки беруться оголошення</h2>
            <p>
              Оголошення надходять від роботодавців або з відкритих джерел. У картці
              вакансії є дата оголошення й опис. Якщо вказано першоджерело, відкрийте
              його, щоб звірити умови. Посилання на відповідний допис у Telegram
              доступне окремо, якщо такий допис є.
            </p>

            <h2>Що перевірити перед відгуком</h2>
            <p>
              За датою на картці можна оцінити свіжість оголошення. Щоб дізнатися,
              чи ще триває набір, зверніться до роботодавця. Уточніть, де розташоване
              робоче місце, який графік і як нараховують оплату. Спосіб відгуку шукайте в описі конкретної вакансії або в дописі.
            </p>
            <p>
              <Link href="/zarplatomir">Зарплатомір</Link> показує суми, зазначені у
              вибірці вакансій сайту. На сторінці є кількість врахованих оголошень і
              пояснення розрахунку. Фактичну оплату за конкретною вакансією уточнюйте
              у роботодавця.
            </p>

            <h2>Як повідомити про помилку</h2>
            <p>
              Якщо вакансію закрито або в описі є неточність, напишіть адміністрації
              в Telegram{" "}
              <a href={getOutboundHref(OUTBOUND_DESTINATIONS["telegram-admin"], path)} target="_blank" rel={OUTBOUND_REL}>
                @Smila_admin
              </a>
              . Додайте посилання на картку й коротко опишіть, що потрібно перевірити.
              Для нових оголошень є{" "}
              <Link href="/rabotodavtsyam">форма розміщення вакансії</Link>.
            </p>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
