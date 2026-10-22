import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { LANDINGS, landingTitle } from "@/lib/seo";
import { getActiveVacancies } from "@/lib/data";

const seo = LANDINGS.find((l) => l.slug === "robota-z-shchodennoyu-oplatoyu")!;

export function generateMetadata(): Metadata {
  const count = getActiveVacancies().filter(seo.filter).length;
  return {
  title: landingTitle(seo.h1, count),
  description: seo.description,
  alternates: { canonical: `/${seo.slug}` },
  };
}

export default function Page() {
  return <LandingPage seo={seo} />;
}

export const dynamic = "force-dynamic";
