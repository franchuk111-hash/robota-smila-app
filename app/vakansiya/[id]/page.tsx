import { experienceStatus, vacancyLocation, canPublishJobPosting } from "@/lib/vacancy-facts";
import { getOutboundHref, getVacancySourceHref, OUTBOUND_REL } from "@/lib/outbound-links";
import { isListedVacancy } from "@/lib/vacancy-lifecycle";
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
import { ALL_VACANCIES, COMPANIES, getActiveVacancies, salaryFmt, dateFmt, vacancyTgLink, ageInDays, TELEGRAM_CHANNEL_URL } from "@/lib/data";
import { KNOWN_COMPANY_URLS, vacancyFaq, faqLd } from "@/lib/seo";

const metadataTitleBudget = 70 - Array.from(" | robota-smila").length;
function fitMetadata(value: string, budget: number) {
  const chars = Array.from(value.trim());
  return chars.length > budget ? `${chars.slice(0, budget - 1).join("").trimEnd()}…` : value.trim();
}

function vacancyMetadataTitle(v: (typeof ALL_VACANCIES)[number]) {
  const peers = ALL_VACANCIES.filter(x => x.title.trim() === v.title.trim());
  const sameCompany = peers.filter(x => x.company === v.company).length > 1;
  const suffix = sameCompany ? ` — Сміла №${v.id}` : " — Сміла";
  const role = fitMetadata(v.title, metadataTitleBudget - Array.from(suffix).length);
  if (peers.length === 1 || sameCompany) return `${role}${suffix}`;
  const remaining = metadataTitleBudget - Array.from(role + suffix + " · ").length;
  // Preserve the role first; add company context only when it can remain readable.
  return remaining >= 6
    ? `${role} · ${fitMetadata(v.company, remaining)}${suffix}`
    : `${role}${suffix}`;
}

const vacancyTitles = new Map(ALL_VACANCIES.map(v => [v.id, vacancyMetadataTitle(v)]));
const repeatedTitles = new Set([...vacancyTitles.values()].filter((title, index, values) => values.indexOf(title) !== index));
for (const v of ALL_VACANCIES) {
  if (repeatedTitles.has(vacancyTitles.get(v.id)!)) {
    const suffix = ` — Сміла №${v.id}`;
    vacancyTitles.set(v.id, `${fitMetadata(v.title, metadataTitleBudget - Array.from(suffix).length)}${suffix}`);
  }
}

export function generateStaticParams() {
  return ALL_VACANCIES.map((v) => ({ id: String(v.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const v = ALL_VACANCIES.find((x) => String(x.id) === id);
  if (!v) return { title: "Вакансію не знайдено" };
  const title = vacancyTitles.get(v.id)!;
  const identifier = title.includes(`№${v.id}`) ? ` №${v.id}` : "";
  return {
    title,
    description: `${v.company} шукає ${v.title.toLowerCase()} у Смілі. ${v.typeName}, ${v.schedule}. Умови та спосіб відгуку в оголошенні${identifier}.`,
    robots: isListedVacancy(v) ? undefined : { index: false, follow: true },
    alternates: { canonical: `/vakansiya/${v.id}` },
  };
}

export default async function VacancyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const v = ALL_VACANCIES.find((x) => String(x.id) === id);
  if (!v) notFound();

  const similar = getActiveVacancies().filter((x) => x.cat === v.cat && x.id !== v.id).slice(0, 3);
  const faqs = vacancyFaq(v);
  const stale = !isListedVacancy(v);

  const hasSalary = !(v.salary[0] === 0 && v.salary[1] === 0);
  const companyUrl = KNOWN_COMPANY_URLS[v.company];
  const company = COMPANIES.find(c => c.name === v.company);
  const ld = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: v.title,
    description: `<p>${escapeHtml(v.short)}</p>` +
      [["Деталі вакансії", v.duties], ["Вимоги", v.req], ["Ми пропонуємо", v.offer]].map(([heading, values]) =>
        (values as string[]).length ? `<h3>${heading}</h3><ul>${(values as string[]).map((d) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>` : ""
      ).join(""),
    identifier: {
      "@type": "PropertyValue",
      name: v.company,
      value: String(v.id),
    },
    datePosted: v.date,
    ...(v.validThrough && { validThrough: v.validThrough }),
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
      <main>
      {!stale && canPublishJobPosting(v) && <JsonLd data={ld} />}
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
              {company ? <Link href={`/kompaniya/${company.slug}`}>{v.company}</Link> : v.company}
              {companyUrl && (
                <>
                  {" "}
                  <a href={companyUrl} target="_blank" rel="noopener noreferrer" aria-label={`Сайт компанії ${v.company}`}>
                    ↗
                  </a>
                </>
              )}
            </div>
            <div className="salary">{salaryFmt(v.salary)}</div>
            <ShareButton standalone title={v.title} url={`/vakansiya/${v.id}`} />
            <div className="tags">
              <span className="tag">{v.typeName}</span>
              <span className="tag gray">{v.schedule}</span>
              {experienceStatus(v) === "not-required" && <span className="tag">Без досвіду</span>}
              <span className="tag gray">
                📍 {vacancyLocation(v)}
              </span>
              <span className="tag gray">Опубліковано: {dateFmt(v.date)}</span>
            </div>
            <p style={{ fontSize: 18 }}>{v.short}</p>
            {stale ? (
              <div className="callout warn">
                <b>Архівне оголошення — актуальність не підтверджена.</b> Оголошення опубліковано {dateFmt(v.date)} (
                {ageInDays(v.date)} дн. тому) — роботодавець міг уже закрити цю вакансію.
                Цю вакансію не включено до поточної добірки. Уточнюйте стан у джерелі.{" "}
                <Link href={`/vakansii/${v.cat}`}>Свіжі вакансії категорії</Link> та нові
                пропозиції Сміли дивіться в{" "}
                <a href={getOutboundHref(TELEGRAM_CHANNEL_URL, `/vakansiya/${v.id}`)} target="_blank" rel={OUTBOUND_REL}>
                  Telegram-каналі
                </a>
                .
              </div>
            ) : (
              <div className="callout tip">
                <b>Свіже оголошення.</b> Опубліковано {dateFmt(v.date)} — {ageInDays(v.date)} дн.
                тому. Відкрийте пост у Telegram, щоб перевірити спосіб зв’язку з роботодавцем. Заявка автоматично не надсилається.
              </div>
            )}
            {v.sourceUrl && <p>Джерело: <a href={getVacancySourceHref(v.id)} target="_blank" rel={OUTBOUND_REL}>{v.source || "Оригінальне оголошення"}</a>. Уточнюйте актуальність і спосіб відгуку у джерелі.</p>}
            {v.duties.length > 0 && <><h3>Деталі вакансії</h3><ul>{v.duties.map((d) => <li key={d}>{d}</li>)}</ul></>}
            {v.req.length > 0 && <><h3>Вимоги</h3><ul>{v.req.map((d) => <li key={d}>{d}</li>)}</ul></>}
            {v.offer.length > 0 && <><h3>Ми пропонуємо</h3><ul>{v.offer.map((d) => <li key={d}>{d}</li>)}</ul></>}
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
            </main>
<Footer />
    </>
  );
}

export const dynamic = "force-dynamic";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
