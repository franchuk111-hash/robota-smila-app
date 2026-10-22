import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { LANDINGS, vacancyCountLabel } from "@/lib/seo";
import { getActiveVacancies } from "@/lib/data";

const seo = LANDINGS.find((l) => l.slug === "pidrobitok")!;

export function generateMetadata(): Metadata {
  const count = getActiveVacancies().filter(seo.filter).length;
  return {
  title: `Підробіток у Смілі — ${vacancyCountLabel(count)}: часткова зайнятість`,
  description: seo.description,
  alternates: { canonical: `/${seo.slug}` },
  };
}

export default function Page() {
  return <LandingPage seo={seo} />;
}

export const dynamic = "force-dynamic";
