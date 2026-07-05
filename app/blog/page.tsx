import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ARTICLES } from "@/lib/data";

export const metadata: Metadata = {
  title: "Блог про роботу у Смілі — поради та зарплати",
  description:
    "Корисні статті про пошук роботи у Смілі: середні зарплати, як скласти резюме, робота без досвіду та поради для шукачів роботи Черкаської області.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <>
      <Header />
      <div className="container">
        <nav className="crumbs">
          <Link href="/">Головна</Link> › Блог
        </nav>
        <h1 className="page-h1">Блог про роботу у Смілі</h1>
        <p className="sub">Поради для шукачів роботи, огляди зарплат та корисні матеріали</p>
        <div className="grid3">
          {ARTICLES.map((a) => (
            <article className="vac" key={a.slug}>
              <h3>
                <Link href={`/blog/${a.slug}`}>{a.title}</Link>
              </h3>
              <div className="locs dim" style={{ marginBottom: 12 }}>
                {new Date(a.date).toLocaleDateString("uk-UA", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <p style={{ color: "var(--muted)", margin: "0 0 16px" }}>{a.excerpt}</p>
              <Link href={`/blog/${a.slug}`} className="btn ghost">
                Читати статтю
              </Link>
            </article>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
