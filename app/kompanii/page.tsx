import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { COMPANIES, VACANCIES } from "@/lib/data";

export const metadata: Metadata = {
  title: "Компанії Сміли — роботодавці та їхні вакансії",
  description:
    "Каталог роботодавців Сміли: магазини, виробництва, транспортні та будівельні компанії. Дізнайтесь про компанію та переглядайте її актуальні вакансії.",
  alternates: { canonical: "/kompanii" },
};

export default function KompaniiPage() {
  return (
    <>
      <Header />
      <div className="container">
        <nav className="crumbs">
          <Link href="/">Головна</Link> › Компанії
        </nav>
        <h1 className="page-h1">Компанії Сміли</h1>
        <p className="sub">Роботодавці міста та їхні актуальні вакансії</p>
        <div className="grid3">
          {COMPANIES.map((c) => {
            const n = VACANCIES.filter((v) => v.company === c.name).length;
            return (
              <article className="vac" key={c.slug}>
                <div className="company" style={{ fontSize: 19, marginBottom: 10 }}>
                  <span
                    className="co-ico"
                    style={{
                      width: 40,
                      height: 40,
                      fontSize: 22,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--soft)",
                    }}
                  >
                    {c.ico}
                  </span>
                  <Link href={`/kompaniya/${c.slug}`} style={{ color: "var(--ink2)" }}>
                    {c.name}
                  </Link>
                </div>
                <div className="locs">
                  {c.industry}
                  <span className="dot">·</span>Сміла, {c.district}
                </div>
                <p style={{ color: "var(--muted)", margin: "12px 0 16px" }}>{c.about}</p>
                <Link href={`/kompaniya/${c.slug}`} className="btn ghost">
                  {n} {n === 1 ? "вакансія" : "вакансій"} →
                </Link>
              </article>
            );
          })}
        </div>
      </div>
      <Footer />
    </>
  );
}
