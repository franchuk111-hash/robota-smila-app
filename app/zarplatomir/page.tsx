import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Zarplatomir from "@/components/Zarplatomir";

export const metadata: Metadata = {
  title: "Зарплатомір Сміла — середні зарплати за професіями 2026",
  description:
    "Дізнайтесь середню зарплату у Смілі за професіями: продавці, водії, робітники, офіс. Актуальні дані на основі вакансій robota-smila.",
  alternates: { canonical: "/zarplatomir" },
};

export default function ZarplatomirPage() {
  return (
    <>
      <Header />
      <div className="container">
        <nav className="crumbs">
          <Link href="/">Головна</Link> › Зарплатомір
        </nav>
        <h1 className="page-h1">Зарплатомір Сміли</h1>
        <p className="sub">
          На яку зарплату можна претендувати у Смілі — за реальними вакансіями сайту
        </p>
        <Zarplatomir />
      </div>
      <Footer />
    </>
  );
}
