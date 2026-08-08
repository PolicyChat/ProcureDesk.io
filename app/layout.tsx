import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MobileCta from "@/components/MobileCta";
import { DOMAIN, META } from "@/lib/content";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://${DOMAIN}`),
  title: {
    default: META.title,
    template: `%s — ${META.title.split(" — ")[0]}`,
  },
  description: META.description,
  openGraph: {
    title: META.title,
    description: META.description,
    url: `https://${DOMAIN}`,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
        <MobileCta />
      </body>
    </html>
  );
}
