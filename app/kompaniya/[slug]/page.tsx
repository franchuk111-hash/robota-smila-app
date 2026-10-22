import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VacCard from "@/components/VacCard";
import BreadcrumbLd from "@/components/BreadcrumbLd";
import { COMPANIES, getActiveVacancies } from "@/lib/data";

export function generateStaticParams() {
  return COMPANIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const VACANCIES = getActiveVacancies();
  const { slug } = await params;
  const c = COMPANIES.find((x) => x.slug === slug);
  if (!c) return { title: "Компанію не знайдено" };
  const suffix = " — вакансії у Смілі";
  const nameBudget = 65 - Array.from(" | robota-smila").length - Array.from(suffix).length;
  // Abbreviate the legal form before truncating, retaining the distinctive name.
  const conciseName = c.name.trim()
    .replace(/^ТОВАРИСТВО З ОБМЕЖЕНОЮ ВІДПОВІДАЛЬНІСТЮ\s*/iu, "ТОВ ")
    .replace(/^ПРИВАТНЕ ПІДПРИЄМСТВО\s*/iu, "ПП ");
  const name = Array.from(conciseName);
  const titleName = name.length > nameBudget
    ? `${name.slice(0, nameBudget - 1).join("").trimEnd()}…`
    : conciseName;
  return {
    title: `${titleName}${suffix}`,
    description: `${c.name}: ${c.about} Актуальні вакансії у Смілі.`,
    robots: VACANCIES.some(v => v.company === c.name) ? undefined : { index: false, follow: true },
    alternates: { canonical: `/kompaniya/${c.slug}` },
  };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const VACANCIES = getActiveVacancies();
  const { slug } = await params;
  const c = COMPANIES.find((x) => x.slug === slug);
  if (!c) notFound();
  const list = VACANCIES.filter((v) => v.company === c.name);

  const ld = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: c.name,
    description: c.about,
  };

  return (
    <>
      <Header />
      <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <BreadcrumbLd
        items={[
          { name: "Головна", path: "/" },
          { name: "Компанії", path: "/kompanii" },
          { name: c.name },
        ]}
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
            <span className="dot">·</span>{c.district}
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
            </main>
<Footer />
    </>
  );
}

export const dynamic = "force-dynamic";
