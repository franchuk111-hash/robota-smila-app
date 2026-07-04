import Link from "next/link";

export default function Footer() {
  return (
    <footer className="site">
      <div className="container">
        <div className="fcols">
          <div>
            <h4>robota-smila.com.ua</h4>
            <p style={{ color: "#8397ab", margin: 0 }}>
              Локальний сайт пошуку роботи у Смілі та Черкаській області. Свіжі
              вакансії щодня.
            </p>
          </div>
          <div>
            <h4>Шукачам</h4>
            <Link href="/vakansii">Всі вакансії</Link>
            <Link href="/vakansii?cat=prodavets">Робота продавцем</Link>
            <Link href="/vakansii?cat=voditel">Робота водієм</Link>
            <Link href="/uvijty">Увійти</Link>
          </div>
          <div>
            <h4>Роботодавцям</h4>
            <Link href="/rabotodavtsyam">Розмістити вакансію</Link>
            <Link href="/kompanii">Каталог компаній</Link>
          </div>
          <div>
            <h4>Інформація</h4>
            <Link href="/blog">Блог</Link>
            <Link href="/kompanii">Компанії Сміли</Link>
          </div>
        </div>
        <div className="fbottom">
          © 2026 robota-smila.com.ua — Робота у Смілі. Всі права захищені.
        </div>
      </div>
    </footer>
  );
}
