import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SITE } from "@/lib/site";
import "./globals.css";

// Polices hébergées dans le projet : aucune dépendance à Google au build ni au chargement.
const serif = localFont({
  variable: "--font-instrument-serif",
  src: "../fonts/instrument-serif-latin-400-normal.woff2",
  weight: "400",
  display: "swap",
});

const sans = localFont({
  variable: "--font-plex-sans",
  src: [
    { path: "../fonts/ibm-plex-sans-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/ibm-plex-sans-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/ibm-plex-sans-latin-600-normal.woff2", weight: "600" },
  ],
  display: "swap",
});

const mono = localFont({
  variable: "--font-plex-mono",
  src: "../fonts/ibm-plex-mono-latin-500-normal.woff2",
  weight: "500",
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
