import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Політика cookie — Робота Сміла",
  description:
    "Політика використання файлів cookie на сайті robota-smila.com.ua: які cookie ми застосовуємо та як ними керувати.",
  alternates: { canonical: "/polityka-cookie" },
};

export default function CookiePolicyPage() {
  return (
    <>
      <Header />
      <div className="container">
        <nav className="crumbs">
          <Link href="/">Головна</Link> › Політика cookie
        </nav>
        <article className="legal">
          <h1 className="page-h1">Політика використання файлів cookie</h1>
          <p className="legal-upd">Останнє оновлення: 7 липня 2026 року</p>

          <p>
            Ця Політика пояснює, що таке файли cookie, які з них використовує сайт{" "}
            <b>robota-smila.com.ua</b> та як ви можете керувати ними.
          </p>

          <h2>1. Що таке cookie</h2>
          <p>
            Cookie — це невеликі текстові файли, які зберігаються у вашому браузері під
            час відвідування сайту. Вони допомагають сайту працювати коректно та
            запам’ятовувати ваші налаштування.
          </p>

          <h2>2. Які cookie ми використовуємо</h2>
          <table>
            <thead>
              <tr>
                <th>Категорія</th>
                <th>Призначення</th>
                <th>Згода</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Необхідні</td>
                <td>
                  Забезпечують базову роботу сайту та запам’ятовують ваш вибір щодо
                  cookie.
                </td>
                <td>Не потребують згоди</td>
              </tr>
              <tr>
                <td>Аналітичні</td>
                <td>
                  Google Analytics — знеособлена статистика відвідувань для покращення
                  сайту.
                </td>
                <td>Лише за вашою згодою</td>
              </tr>
            </tbody>
          </table>

          <div className="legal-note">
            Аналітичні cookie (Google Analytics) вмикаються <b>лише після того</b>, як ви
            натиснете «Прийняти всі» в банері cookie. Якщо ви обрали «Тільки необхідні»,
            скрипти аналітики не завантажуються.
          </div>

          <h2>3. Google Analytics</h2>
          <p>
            Ми використовуємо Google Analytics для розуміння того, як відвідувачі
            користуються сайтом. IP-адреса анонімізується. Дані обробляються згідно з{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Політикою конфіденційності Google
            </a>
            .
          </p>

          <h2>4. Як керувати cookie</h2>
          <ul>
            <li>
              Ви робите вибір у банері cookie під час першого відвідування (Прийняти всі
              / Тільки необхідні).
            </li>
            <li>
              Щоб змінити рішення, очистіть дані сайту у браузері — банер з’явиться знову.
            </li>
            <li>
              Ви також можете заблокувати чи видалити cookie в налаштуваннях свого
              браузера.
            </li>
          </ul>

          <h2>5. Зміни до Політики</h2>
          <p>
            Ми можемо оновлювати цю Політику. Актуальна версія завжди доступна на цій
            сторінці.
          </p>

          <p style={{ marginTop: 26 }}>
            Див. також:{" "}
            <Link href="/polityka-konfidentsiynosti">Політика конфіденційності</Link> ·{" "}
            <Link href="/umovy-korystuvannya">Умови користування</Link>.
          </p>
        </article>
      </div>
      <Footer />
    </>
  );
}
