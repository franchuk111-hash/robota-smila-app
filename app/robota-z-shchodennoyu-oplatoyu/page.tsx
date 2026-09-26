import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { LANDINGS, landingTitle } from "@/lib/seo";
import { VACANCIES } from "@/lib/data";

const seo = LANDINGS.find((l) => l.slug === "robota-z-shchodennoyu-oplatoyu")!;
const count = VACANCIES.filter(seo.filter).length;

export const metadata: Metadata = {
  title: landingTitle(seo.h1, count),
  description: seo.description,
  alternates: { canonical: `/${seo.slug}` },
};

export default function Page() {
  return <LandingPage seo={seo} />;
}
