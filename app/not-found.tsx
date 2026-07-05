import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <div className="container" style={{ textAlign: "center", padding: "70px 22px" }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>🔍</div>
        <h1 className="page-h1">Сторінку не знайдено</h1>
        <p className="sub" style={{ maxWidth: 520, margin: "0 auto 28px" }}>
          Можливо, вакансію вже закрито або посилання застаріло. Але у Смілі є
          багато інших пропозицій!
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/vakansii" className="btn lg">Всі вакансії</Link>
          <Link href="/" className="btn ghost lg">На головну</Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
