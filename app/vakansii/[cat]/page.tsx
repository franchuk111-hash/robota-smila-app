import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VacCard from "@/components/VacCard";
import BreadcrumbLd from "@/components/BreadcrumbLd";
import { VACANCIES, CATEGORIES } from "@/lib/data";
import { CATEGORY_SEO } from "@/lib/seo";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ cat: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cat: string }>;
}): Promise<Metadata> {
  const { cat } = await params;
  const seo = CATEGORY_SEO[cat];
  if (!seo) return { title: "Категорію не знайдено" };
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: `/vakansii/${cat}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ cat: string }>;
}) {
  const { cat } = await params;
  const seo = CATEGORY_SEO[cat];
  const category = CATEGORIES.find((c) => c.slug === cat);
  if (!seo || !category) notFound();

  const list = VACANCIES.filter((v) => v.cat === cat).sort(
    (a, b) => +new Date(b.date) - +new Date(a.date)
  );
  const others = CATEGORIES.filter((c) => c.slug !== cat);

  return (
    <>
      <Header />
      <BreadcrumbLd
        items={[
          { name: "Головна", path: "/" },
          { name: "Вакансії", path: "/vakansii" },
          { name: category.name, path: `/vakansii/${cat}` },
        ]}
      />
      <div className="container">
        <nav className="crumbs">
          <Link href="/">Головна</Link> › <Link href="/vakansii">Вакансії</Link> ›{" "}
          {category.name}
        </nav>
        <h1 className="page-h1">{seo.h1}</h1>
        <p className="sub">
          Знайдено вакансій: {list.length}. Нові пропозиції додаються щотижня.
        </p>

        <div className="grid3">
          {list.length ? (
            list.map((v) => <VacCard key={v.id} v={v} />)
          ) : (
            <div className="vac">
              Наразі відкритих вакансій у цій категорії немає. Загляньте пізніше або
              перегляньте <Link href="/vakansii">всі вакансії Сміли</Link>.
            </div>
          )}
        </div>

        <p style={{ margin: "26px 0" }}>
          <Link href={`/vakansii?cat=${cat}`} className="btn ghost">
            Відкрити з фільтрами →
          </Link>
        </p>

        <div className="seo-text">
          <h2>{seo.h1}: що варто знати</h2>
          {seo.text.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <section className="block" style={{ paddingBottom: 0 }}>
          <h2 className="title" style={{ fontSize: 24 }}>
            Інші категорії вакансій у Смілі
          </h2>
          <div className="cats" style={{ marginTop: 16 }}>
            {others.map((c) => {
              const n = VACANCIES.filter((v) => v.cat === c.slug).length;
              return (
                <Link key={c.slug} className="cat" href={`/vakansii/${c.slug}`}>
                  <span className="ico">{c.ico}</span>
                  <span>
                    <span className="n">{c.name}</span>
                    <br />
                    <span className="c">{n} вакансій</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
