import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import ServiceWorker from "@/components/ServiceWorker";
import SubscribeMechanics from "@/components/SubscribeMechanics";
import CookieConsent from "@/components/CookieConsent";
import Analytics from "@/components/Analytics";

export const metadata: Metadata = {
  metadataBase: new URL("https://robota-smila.com.ua"),
  title: {
    default: "Робота в Смілі — свіжі вакансії 2026 | robota-smila.com.ua",
    template: "%s | robota-smila",
  },
  description:
    "Актуальні вакансії у Смілі та Черкаській області. Знайдіть роботу без досвіду, підробіток чи повну зайнятість. Нові вакансії щодня.",
  applicationName: "robota-smila",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "robota-smila" },
  formatDetection: { telephone: false },
  openGraph: {
    siteName: "Робота Сміла",
    locale: "uk_UA",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Робота Сміла — вакансії міста" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="uk">
      <body>
        <Providers>{children}</Providers>
        <SubscribeMechanics />
        <CookieConsent />
        <Analytics />
        <ServiceWorker />
      </body>
    </html>
  );
}
