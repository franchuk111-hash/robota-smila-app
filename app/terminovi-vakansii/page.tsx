import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";
import { LANDINGS } from "@/lib/seo";

const seo = LANDINGS.find((l) => l.slug === "terminovi-vakansii")!;

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  alternates: { canonical: `/${seo.slug}` },
};

export default function Page() {
  return <LandingPage seo={seo} />;
}
