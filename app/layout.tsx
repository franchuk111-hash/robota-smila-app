import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import Providers from "@/components/Providers";
import ServiceWorker from "@/components/ServiceWorker";
import SubscribeMechanics from "@/components/SubscribeMechanics";

const GA_ID = "G-TRNR43ZLM5";

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
        <ServiceWorker />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
