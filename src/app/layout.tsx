import type { Metadata, Viewport } from "next";
import { Instrument_Serif, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { SITE } from "@/lib/site";
import "./globals.css";

const serif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const sans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.nom} — ${SITE.promesse}`,
    template: `%s · ${SITE.nom}`,
  },
  description: SITE.description,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: SITE.nom,
    title: SITE.promesse,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.promesse,
    description: SITE.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f1e8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body
        className={`${serif.variable} ${sans.variable} ${mono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
