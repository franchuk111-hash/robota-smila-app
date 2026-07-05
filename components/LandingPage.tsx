import Link from "next/link";
import Header from "./Header";
import Footer from "./Footer";
import VacCard from "./VacCard";
import BreadcrumbLd from "./BreadcrumbLd";
import { VACANCIES } from "@/lib/data";
import type { LandingSeo } from "@/lib/seo";

// Спільний шаблон посадкових сторінок (без досвіду / підробіток / студентам)
export default function LandingPage({ seo }: { seo: LandingSeo }) {
  const list = VACANCIES.filter(seo.filter).sort(
    (a, b) => +new Date(b.date) - +new Date(a.date)
  );

  return (
    <>
      <Header />
      <BreadcrumbLd
        items={[
          { name: "Головна", path: "/" },
          { name: seo.h1, path: `/${seo.slug}` },
        ]}
      />
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
