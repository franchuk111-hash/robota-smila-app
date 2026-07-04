import Link from "next/link";
import Emblem from "./Emblem";

export default function Footer() {
  return (
    <footer className="site">
      <div className="container">
        <div className="fcols">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <Emblem size={36} />
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>
                robota-<span style={{ color: "#5b9dff" }}>smila</span>
              </span>
            </div>
            <p style={{ color: "#8397ab", margin: "0 0 6px" }}>
              Знайди роботу в Смілі. Розвивай місто разом із нами.
            </p>
            <div className="socials">
              <a className="soc" href="https://www.tiktok.com/@robota_smila" target="_blank" rel="noopener noreferrer">
                🎵 TikTok
              </a>
              <a className="soc" href="https://www.youtube.com/@Robota-smila" target="_blank" rel="noopener noreferrer">
                ▶️ YouTube
              </a>
              <a className="soc" href="https://t.me/Smila_admin" target="_blank" rel="noopener noreferrer">
                ✈️ Telegram
              </a>
            </div>
          </div>
          <div>
            <h4>Шукачам</h4>
            <Link href="/vakansii">Всі вакансії</Link>
            <Link href="/rezume">Приклад резюме</Link>
            <Link href="/zarplatomir">Зарплатомір</Link>
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
            <a href="https://t.me/Smila_admin" target="_blank" rel="noopener noreferrer">
              Зв&apos;язок: @Smila_admin
            </a>
          </div>
        </div>
        <div className="fbottom">
          © 2026 robota-smila.com.ua — Робота у Смілі. Всі права захищені.
        </div>
      </div>
    </footer>
  );
}
