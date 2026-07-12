import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Catalog from "@/components/Catalog";
import JsonLd from "@/components/JsonLd";
import { VACANCIES, CATEGORIES } from "@/lib/data";
import { itemListLd } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Всі вакансії Сміли — знайти роботу онлайн",
  description:
    "Каталог вакансій Сміли: продавці, водії, робітники, охорона та інші. Фільтруйте за графіком і зарплатою. Відгукніться на роботу мрії вже сьогодні!",
  alternates: { canonical: "/vakansii" },
};

export default async function VakansiiPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; cat?: string; exp?: string }>;
}) {
  const sp = await searchParams;
  const recent = [...VACANCIES]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 25);
  return (
    <>
      <Header />
      <JsonLd data={itemListLd(recent)} />
      <Catalog
        vacancies={VACANCIES}
        categories={CATEGORIES}
        initialQ={sp.q || ""}
        initialCat={sp.cat || ""}
        initialExp={!!sp.exp}
      />
      <Footer />
    </>
  );
}
