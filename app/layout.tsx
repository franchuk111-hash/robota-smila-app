import type { Metadata, Viewport } from "next";
import { SITE_NAME, HOME_TITLE, HOME_DESCRIPTION } from "@/lib/site-metadata";
import "./globals.css";
import Providers from "@/components/Providers";
import ServiceWorker from "@/components/ServiceWorker";
import SubscribeMechanics from "@/components/SubscribeMechanics";
import CookieConsent from "@/components/CookieConsent";
import TelegramClickAnalytics from "@/components/TelegramClickAnalytics";
import Analytics from "@/components/Analytics";

export const metadata: Metadata = {
  metadataBase: new URL("https://robota-smila.com.ua"),
  title: {
    default: HOME_TITLE,
    template: "%s | robota-smila",
  },
  description: HOME_DESCRIPTION,
  applicationName: SITE_NAME,
  appleWebApp: { capable: true, statusBarStyle: "default", title: SITE_NAME },
  formatDetection: { telephone: false },
  openGraph: {
    siteName: SITE_NAME,
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
        <TelegramClickAnalytics />
        <ServiceWorker />
      </body>
    </html>
  );
}
