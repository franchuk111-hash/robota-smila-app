import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { LANDINGS, landingTitle } from "@/lib/seo";
import { getActiveVacancies } from "@/lib/data";

const seo = LANDINGS.find((l) => l.slug === "robota-dlya-studentiv")!;

export function generateMetadata(): Metadata {
  const count = getActiveVacancies().filter(seo.filter).length;
  return {
  title: landingTitle(seo.h1, count),
  description: seo.description,
  robots: count === 0 ? { index: false, follow: true } : undefined,
  alternates: { canonical: `/${seo.slug}` },
  };
}

export default function Page() {
  return <LandingPage seo={seo} />;
}

export const dynamic = "force-dynamic";
