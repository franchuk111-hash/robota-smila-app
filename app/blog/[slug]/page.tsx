import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbLd from "@/components/BreadcrumbLd";
import { ARTICLES } from "@/lib/data";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = ARTICLES.find((x) => x.slug === slug);
  if (!a) return { title: "Статтю не знайдено" };
  return {
    title: a.title,
    description: a.excerpt,
    alternates: { canonical: `/blog/${a.slug}` },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = ARTICLES.find((x) => x.slug === slug);
  if (!a) notFound();

  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.excerpt,
    datePublished: a.date,
    inLanguage: "uk-UA",
    author: { "@type": "Organization", name: "robota-smila.com.ua" },
    publisher: { "@type": "Organization", name: "robota-smila.com.ua" },
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
          { name: "Блог", path: "/blog" },
          { name: a.title },
        ]}
      />
      <div className="container">
        <nav className="crumbs">
          <Link href="/">Головна</Link> › <Link href="/blog">Блог</Link> › {a.title}
        </nav>
        <article className="detail" style={{ maxWidth: 820, margin: "0 auto" }}>
          <h1>{a.title}</h1>
          <div className="locs dim" style={{ margin: "8px 0 20px" }}>
            {new Date(a.date).toLocaleDateString("uk-UA", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
          {a.body.map((p, i) => (
            <p key={i} style={{ fontSize: 18 }} dangerouslySetInnerHTML={{ __html: p }} />
          ))}
        </article>
        <div style={{ maxWidth: 820, margin: "26px auto 0", textAlign: "center" }}>
          <Link href="/vakansii" className="btn lg">
            Переглянути вакансії у Смілі
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
