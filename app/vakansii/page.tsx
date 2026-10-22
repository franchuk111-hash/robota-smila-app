import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Catalog from "@/components/Catalog";
import JsonLd from "@/components/JsonLd";
import { getActiveVacancies, CATEGORIES } from "@/lib/data";
import { itemListLd } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вакансії у Смілі — зарплати, графік, пошук роботи",
  description:
    "Усі вакансії у Смілі в одному каталозі. Знайдіть роботу за професією, зарплатою та графіком, перевірте вимоги й відкрийте контакти в Telegram.",
  alternates: { canonical: "/vakansii" },
};

export default async function VakansiiPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; exp?: string }>;
}) {
  const VACANCIES = getActiveVacancies();
  const sp = await searchParams;
  const hasFilters = Boolean(sp.q || sp.cat || sp.exp);
  const recent = [...VACANCIES]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 25);
  return (
    <>
      <Header />
      <main>
      {!hasFilters && <JsonLd data={itemListLd(recent)} />}
      <Catalog
        vacancies={VACANCIES}
        categories={CATEGORIES}
        initialQ={sp.q || ""}
        initialCat={sp.cat || ""}
        initialExp={!!sp.exp}
      />
            </main>
<Footer />
    </>
  );
}

export const dynamic = "force-dynamic";
