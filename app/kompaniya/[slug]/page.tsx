import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VacCard from "@/components/VacCard";
import { COMPANIES, VACANCIES } from "@/lib/data";

export function generateStaticParams() {
  return COMPANIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = COMPANIES.find((x) => x.slug === slug);
  if (!c) return { title: "Компанію не знайдено" };
  return {
    title: `${c.name} — вакансії у Смілі`,
    description: `${c.name}: ${c.about} Актуальні вакансії у Смілі.`,
  };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = COMPANIES.find((x) => x.slug === slug);
  if (!c) notFound();
  const list = VACANCIES.filter((v) => v.company === c.name);

  const ld = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: c.name,
    description: c.about,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Сміла",
      addressRegion: "Черкаська область",
      addressCountry: "UA",
    },
  };

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <div className="container">
        <nav className="crumbs">
          <Link href="/">Головна</Link> › <Link href="/kompanii">Компанії</Link> › {c.name}
        </nav>
        <div className="detail" style={{ marginBottom: 26 }}>
          <div className="company" style={{ fontSize: 26, marginBottom: 12 }}>
            <span
              className="co-ico"
              style={{
                width: 52,
                height: 52,
                fontSize: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--soft)",
              }}
            >
              {c.ico}
            </span>
            <h1 style={{ margin: 0, fontSize: 30 }}>{c.name}</h1>
          </div>
          <div className="locs" style={{ fontSize: 16 }}>
            {c.industry}
            <span className="dot">·</span>Сміла, {c.district}
          </div>
          <p style={{ fontSize: 18, marginTop: 14 }}>{c.about}</p>
        </div>
        <h2 className="title" style={{ fontSize: 26 }}>
          Вакансії компанії ({list.length})
        </h2>
        <div className="grid3">
          {list.length ? (
            list.map((v) => <VacCard key={v.id} v={v} />)
          ) : (
            <div className="vac">Наразі відкритих вакансій немає. Зазирніть пізніше.</div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
