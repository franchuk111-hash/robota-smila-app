import Link from "next/link";
import Header from "./Header";
import Footer from "./Footer";
import VacCard from "./VacCard";
import BreadcrumbLd from "./BreadcrumbLd";
import JsonLd from "./JsonLd";
import { VACANCIES } from "@/lib/data";
import { LANDING_FAQ, itemListLd, faqLd, type LandingSeo } from "@/lib/seo";

// Спільний шаблон посадкових сторінок (без досвіду / підробіток / студентам)
export default function LandingPage({ seo }: { seo: LandingSeo }) {
  const list = VACANCIES.filter(seo.filter).sort(
    (a, b) => +new Date(b.date) - +new Date(a.date)
  );
  const faqs = LANDING_FAQ[seo.slug] ?? [];

  return (
    <>
      <Header />
      <BreadcrumbLd
        items={[
          { name: "Головна", path: "/" },
          { name: seo.h1, path: `/${seo.slug}` },
        ]}
      />
      {list.length > 0 && <JsonLd data={itemListLd(list)} />}
      {faqs.length > 0 && <JsonLd data={faqLd(faqs)} />}
      <div className="container">
        <nav className="crumbs">
          <Link href="/">Головна</Link> › {seo.h1}
        </nav>
        <h1 className="page-h1">{seo.h1}</h1>
        <p className="sub">Знайдено вакансій: {list.length}</p>

        <div className="grid3">
          {list.map((v) => (
            <VacCard key={v.id} v={v} />
          ))}
        </div>

        <div className="seo-text">
          <h2>{seo.h1}: поради та деталі</h2>
          {seo.text.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {faqs.length > 0 && (
          <section className="faq-block">
            <h2 className="title" style={{ fontSize: 24 }}>
              Часті запитання
            </h2>
            {faqs.map((f, i) => (
              <details key={i} className="faq-item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </section>
        )}

        <p style={{ textAlign: "center", margin: "30px 0" }}>
          <Link href="/vakansii" className="btn lg">
            Всі вакансії Сміли →
          </Link>
        </p>
      </div>
      <Footer />
    </>
  );
}
