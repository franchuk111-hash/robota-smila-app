import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VacCard from "@/components/VacCard";
import ApplyTelegram from "@/components/ApplyTelegram";
import ShareButton from "@/components/ShareButton";
import BreadcrumbLd from "@/components/BreadcrumbLd";
import JsonLd from "@/components/JsonLd";
import { VACANCIES, salaryFmt, dateFmt, vacancyTgLink } from "@/lib/data";
import { validThrough, KNOWN_COMPANY_URLS, vacancyFaq, faqLd } from "@/lib/seo";

export function generateStaticParams() {
  return VACANCIES.map((v) => ({ id: String(v.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const v = VACANCIES.find((x) => x.id === Number(id));
  if (!v) return { title: "Вакансію не знайдено" };
  const salaryTitle =
    v.salary[0] === 0 && v.salary[1] === 0
      ? "договірна оплата"
      : `${v.salary[0].toLocaleString("uk-UA")} ₴`;
  return {
    title: `${v.title} — робота у Смілі, ${salaryTitle}`,
    description: `${v.company} шукає ${v.title.toLowerCase()} у Смілі. ${v.typeName}, ${v.schedule}. Відгукніться онлайн вже сьогодні!`,
    alternates: { canonical: `/vakansiya/${v.id}` },
  };
}

export default async function VacancyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const v = VACANCIES.find((x) => x.id === Number(id));
  if (!v) notFound();

  const similar = VACANCIES.filter((x) => x.cat === v.cat && x.id !== v.id).slice(0, 3);
  const faqs = vacancyFaq(v);

  const hasSalary = !(v.salary[0] === 0 && v.salary[1] === 0);
  const companyUrl = KNOWN_COMPANY_URLS[v.company];
  const ld = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: v.title,
    description:
      `<p>${v.short}</p><ul>` + v.duties.map((d) => `<li>${d}</li>`).join("") + "</ul>",
    identifier: {
      "@type": "PropertyValue",
      name: v.company,
      value: String(v.id),
    },
    datePosted: v.date,
    validThrough: validThrough(v.date),
    directApply: false,
    industry: v.catName,
    url: `https://robota-smila.com.ua/vakansiya/${v.id}`,
    employmentType: v.type === "SHIFT" ? "OTHER" : v.type,
    hiringOrganization: {
      "@type": "Organization",
      name: v.company,
      ...(companyUrl && { url: companyUrl, sameAs: companyUrl }),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Сміла",
        addressRegion: "Черкаська область",
        postalCode: "20700",
        addressCountry: "UA",
      },
    },
    // baseSalary додаємо лише коли є конкретні цифри (для «Договірна» — пропускаємо)
    ...(hasSalary && {
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "UAH",
        value: {
          "@type": "QuantitativeValue",
          minValue: v.salary[0],
          maxValue: v.salary[1],
          unitText: "MONTH",
        },
      },
    }),
  };

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <BreadcrumbLd
        items={[
          { name: "Головна", path: "/" },
          { name: "Вакансії", path: "/vakansii" },
          { name: v.catName, path: `/vakansii/${v.cat}` },
          { name: v.title },
        ]}
      />
      <div className="container">
        <nav className="crumbs">
          <Link href="/">Головна</Link> › <Link href="/vakansii">Вакансії</Link> ›{" "}
          <Link href={`/vakansii/${v.cat}`}>{v.catName}</Link> › {v.title}
        </nav>
        <div className="detail-grid">
          <article className="detail">
            <h1>{v.title}</h1>
            <div className="company" style={{ fontSize: 18 }}>
              {v.company}
            </div>
            <div className="salary">{salaryFmt(v.salary)}</div>
            <ShareButton standalone title={v.title} url={`/vakansiya/${v.id}`} />
            <div className="tags">
              <span className="tag">{v.typeName}</span>
              <span className="tag gray">{v.schedule}</span>
              {!v.exp && <span className="tag">Без досвіду</span>}
              <span className="tag gray">📍 Сміла, {v.district}</span>
              <span className="tag gray">Оновлено: {dateFmt(v.date)}</span>
            </div>
            <p style={{ fontSize: 18 }}>{v.short}</p>
            <h3>Обов&apos;язки</h3>
            <ul>{v.duties.map((d) => <li key={d}>{d}</li>)}</ul>
            <h3>Вимоги</h3>
            <ul>{v.req.map((d) => <li key={d}>{d}</li>)}</ul>
            <h3>Ми пропонуємо</h3>
            <ul>{v.offer.map((d) => <li key={d}>{d}</li>)}</ul>
          </article>
          <ApplyTelegram
            href={vacancyTgLink(v)}
            vacancyId={v.id}
            vacancyTitle={v.title}
            category={v.cat}
          />
        </div>

        <JsonLd data={faqLd(faqs)} />
        <section className="faq-block">
          <h2 className="title" style={{ fontSize: 24 }}>
            Часті запитання про вакансію
          </h2>
          {faqs.map((f, i) => (
            <details key={i} className="faq-item">
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>

        <div style={{ margin: "30px 0" }}>
          <h2 className="title">Схожі вакансії у Смілі</h2>
          <div className="grid3">
            {similar.map((s) => (
              <VacCard key={s.id} v={s} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
