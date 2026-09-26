import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { LANDINGS, vacancyCountLabel } from "@/lib/seo";
import { VACANCIES } from "@/lib/data";

const seo = LANDINGS.find((l) => l.slug === "pidrobitok")!;
const count = VACANCIES.filter(seo.filter).length;

export const metadata: Metadata = {
  title: `Підробіток у Смілі — ${vacancyCountLabel(count)}: часткова зайнятість`,
  description: seo.description,
  alternates: { canonical: `/${seo.slug}` },
};

export default function Page() {
  return <LandingPage seo={seo} />;
}
